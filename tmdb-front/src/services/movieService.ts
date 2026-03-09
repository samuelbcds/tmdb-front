import { api } from './api';
import { getPosterUrl, type Movie, type MovieDetails } from './tmdbService';

export interface BackendMovieDetails {
  id: number;
  title: string;
  synopsis?: string | null;
  release_date?: string | null;
  rating?: number | null;
  imgUrl?: string | null;
  rating_user?: number | null;
}

export interface MovieDetailsFromBackend extends MovieDetails {
  rating_user?: number | null;
}

function mapBackendMovieToMovieDetails(movie: BackendMovieDetails): MovieDetailsFromBackend {
  return {
    id: movie.id,
    title: movie.title,
    original_title: movie.title,
    overview: movie.synopsis || '',
    poster_path: movie.imgUrl || null,
    backdrop_path: null,
    release_date: movie.release_date || '',
    vote_average: movie.rating ?? 0,
    vote_count: 0,
    popularity: 0,
    adult: false,
    genre_ids: [],
    original_language: 'pt-BR',
    video: false,
    genres: [],
    runtime: 0,
    status: 'released',
    tagline: '',
    rating_user: movie.rating_user ?? null,
  };
}

export const getMovieDetailsFromBackend = async (movieId: number): Promise<MovieDetailsFromBackend> => {
  try {
    const response = await api.get(`/movies/${movieId}`);
    const payload = response.data?.movie ?? response.data;

    if (!payload || typeof payload !== 'object') {
      throw new Error('Resposta invalida ao carregar filme do backend.');
    }

    return mapBackendMovieToMovieDetails(payload as BackendMovieDetails);
  } catch (error: any) {
    throw error;
  }
};


export const saveRatedMovie = async (
  movie: Movie | MovieDetails,
  rating_user: number,
  userId: string
): Promise<void> => {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating_user * 2) / 2));
  const formattedDate = movie.release_date || null;
  const posterUrl = movie.poster_path ? getPosterUrl(movie.poster_path, 'w500') : null;
  
  const payload = {
    title: movie.title,
    release_date: formattedDate,
    synopsis: movie.overview,
    rating: movie.vote_average, // Rating do TMDB (0-10)
    imgUrl: posterUrl,
    roster: null,
    user_id: userId,
    rating_user: normalizedRating, // Avaliação do usuário (0-5)
  };
  try {
    await api.post('/movies', payload);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        'Erro ao salvar o filme. Tente novamente.'
    );
  }
};


export const deleteMovie = async (movieId: number): Promise<void> => {
  try {
    await api.delete(`/movies/${movieId}`);
  } catch (error: any) {
    
    throw new Error(
      error.response?.data?.message ||
        'Erro ao deletar o filme. Tente novamente.'
    );
  }
};
