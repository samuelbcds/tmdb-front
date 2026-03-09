import { tmdbApi } from './api';
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  video: boolean;
}

export interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  status: string;
  tagline: string;
}

export interface MovieFiltersParams {
  year?: number;
  genre?: string;
}

interface Genre {
  id: number;
  name: string;
}

let cachedGenres: Genre[] | null = null;


export const getPosterUrl = (
  posterPath: string | null,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string => {
  if (!posterPath) {
    return '/placeholder.png';
  }
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return posterPath;
  }

  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

const normalizeText = (value: string): string => value.trim().toLowerCase();

const getGenres = async (): Promise<Genre[]> => {
  if (cachedGenres) {
    return cachedGenres;
  }

  const response = await tmdbApi.get<{ genres: Genre[] }>('/genre/movie/list', {
    params: {
      language: 'pt-BR',
    },
  });

  cachedGenres = response.data.genres || [];
  return cachedGenres;
};

const resolveGenreId = async (genreName?: string): Promise<number | null> => {
  if (!genreName?.trim()) {
    return null;
  }

  const normalizedGenre = normalizeText(genreName);
  const genres = await getGenres();

  const exactMatch = genres.find((genre) => normalizeText(genre.name) === normalizedGenre);
  if (exactMatch) {
    return exactMatch.id;
  }

  const partialMatch = genres.find((genre) => normalizeText(genre.name).includes(normalizedGenre));
  if (partialMatch) {
    return partialMatch.id;
  }

  return -1;
};

const capTotalPages = (data: MovieSearchResponse): MovieSearchResponse => ({
  ...data,
  total_pages: Math.min(data.total_pages, 500),
});

export const searchMovies = async (
  query: string,
  page: number = 1,
  filters: MovieFiltersParams = {}
): Promise<MovieSearchResponse> => {
  try {
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }

    const genreId = await resolveGenreId(filters.genre);
    if (genreId === -1) {
      return {
        page,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }

    const response = await tmdbApi.get<MovieSearchResponse>('/search/movie', {
      params: {
        query: query.trim(),
        page,
        include_adult: false,
        language: 'pt-BR',
        ...(filters.year ? { primary_release_year: filters.year } : {}),
      },
    });

    const data = capTotalPages(response.data);

    if (!genreId) {
      return data;
    }

    return {
      ...data,
      results: data.results.filter((movie) => movie.genre_ids.includes(genreId)),
    };
  } catch (error: any) {
    console.error('Error searching movies:', error);
    throw new Error(error.response?.data?.status_message || 'Erro ao buscar filmes. Tente novamente.');
  }
};


export const getPopularMovies = async (
  page: number = 1,
  filters: MovieFiltersParams = {}
): Promise<MovieSearchResponse> => {
  try {
    const genreId = await resolveGenreId(filters.genre);
    if (genreId === -1) {
      return {
        page,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }

    if (genreId || filters.year) {
      const discoverResponse = await tmdbApi.get<MovieSearchResponse>('/discover/movie', {
        params: {
          page,
          language: 'pt-BR',
          include_adult: false,
          sort_by: 'popularity.desc',
          ...(filters.year ? { primary_release_year: filters.year } : {}),
          ...(genreId ? { with_genres: genreId } : {}),
        },
      });

      return capTotalPages(discoverResponse.data);
    }

    const response = await tmdbApi.get<MovieSearchResponse>('/movie/popular', {
      params: {
        page,
        language: 'pt-BR',
      },
    });

    return capTotalPages(response.data);
  } catch (error: any) {
    console.error('Error fetching popular movies:', error);
    throw new Error(
      error.response?.data?.status_message || 'Erro ao buscar filmes populares. Tente novamente.'
    );
  }
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  try {
    const response = await tmdbApi.get<MovieDetails>(`/movie/${movieId}`, {
      params: {
        language: 'pt-BR',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching movie details:', error);
    throw new Error(
      error.response?.data?.status_message || 'Erro ao carregar detalhes do filme. Tente novamente.'
    );
  }
};
