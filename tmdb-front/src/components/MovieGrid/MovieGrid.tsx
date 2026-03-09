import type { Movie } from '../../services/tmdbService';
import { MovieCard } from '../MovieCard/MovieCard';
import styles from './MovieGrid.module.css';

interface MovieGridProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

export function MovieGrid({ movies, onMovieClick }: MovieGridProps) {
  return (
    <section className={styles.moviesGrid}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
      ))}
    </section>
  );
}
