import { api } from './api';
import type { Movie } from './tmdbService';
export interface MovieFromDB {
  id: number;
  title: string;
  release_date: string | null;
  synopsis: string | null;
  genre: string | null;
  rating: number | null; // Rating do TMDB (0-10)
  imgUrl: string | null;
  roster: string | null;
  user_id: string | null;
  rating_user: number | null; // Avaliação do usuário (0-5)
  created_at?: string;
  updated_at?: string;
}

interface GetMoviesResponse {
  movies: MovieFromDB[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface GetRatedMoviesResponse {
  movies: Movie[];
  pagination: GetMoviesResponse['pagination'];
}

export interface GetRatedMoviesParams {
  search?: string;
  year?: number;
  genre?: string;
  page?: number;
  per_page?: number;
}


function movieFromDBToMovie(dbMovie: MovieFromDB): Movie {
  return {
    id: dbMovie.id,
    title: dbMovie.title,
    original_title: dbMovie.title,
    overview: dbMovie.synopsis || '',
    poster_path: dbMovie.imgUrl || null,
    backdrop_path: null,
    release_date: dbMovie.release_date || '',
    vote_average: dbMovie.rating || 0,
    vote_count: 0,
    popularity: 0,
    adult: false,
    genre_ids: [],
    original_language: 'en',
    video: false,
  };
}


export async function getRatedMovies(
  params: GetRatedMoviesParams = {}
): Promise<GetRatedMoviesResponse> {
  try {
    const { data } = await api.get<GetMoviesResponse>('/movies', {
      params: {
        ...(params.search ? { search: params.search } : {}),
        ...(params.year ? { year: params.year } : {}),
        ...(params.genre ? { genre: params.genre } : {}),
        ...(params.page ? { page: params.page } : {}),
        ...(params.per_page ? { per_page: params.per_page } : {}),
      },
    });

    return {
      ...data,
      movies: (data.movies || []).map(movieFromDBToMovie),
    };
  } catch (error) {
    console.error('Erro ao buscar filmes avaliados:', error);
    throw error;
  }
}


export async function getMovieRating(movieId: number): Promise<number | null> {
  try {
    const { data } = await api.get<GetMoviesResponse>('/movies', {
      params: {
        per_page: 100,
      },
    });
    const movie = data.movies.find((m) => m.id === movieId);
    
    return movie?.rating_user ?? null;
  } catch (error: any) {
    console.error('Erro ao buscar nota do filme:', error);
    return null;
  }
}
