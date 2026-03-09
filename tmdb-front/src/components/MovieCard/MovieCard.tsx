import { getPosterUrl, type Movie } from '../../services/tmdbService';
import StarIcon from '../../assets/icons/a-star-that-can-be-used-for-favorites-and-recommendations-svgrepo-com.svg?react';
import placeholderImage from '../../assets/placeholder.png';
import styles from './MovieCard.module.css';

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      className={styles.movieCard}
      onClick={() => onClick?.(movie)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick?.(movie);
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.moviePosterWrapper}>
        <img
          src={getPosterUrl(movie.poster_path, 'w342')}
          alt={movie.title}
          className={styles.moviePoster}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = placeholderImage;
          }}
        />
        <div className={styles.movieOverlay}>
          <div className={styles.movieRating}>
            <StarIcon style={{height:'20px', width: '20px'}}/>{' '}
            {movie.vote_average.toFixed(1)}
          </div>
        </div>
      </div>
      <div className={styles.movieInfo}>
        <h3 className={styles.movieTitle} title={movie.title}>
          {movie.title}
        </h3>
        <p className={styles.movieYear}>
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
        </p>
      </div>
    </div>
  );
}
