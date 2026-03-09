import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getMovieDetails,
  getPosterUrl,
  type MovieDetails as MovieDetailsType,
} from '../../services/tmdbService';
import {
  getMovieDetailsFromBackend,
  saveRatedMovie,
  deleteMovie,
  type MovieDetailsFromBackend,
} from '../../services/movieService';
import { getMovieRating } from '../../services/ratingService';
import { PageHeader, StarRating } from '../../components';
import styles from './styles.module.css';

export default function MovieDetails() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { movieId } = useParams();

  const parsedMovieId = Number(movieId);

  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existsInBackend, setExistsInBackend] = useState(false);
  const [deletingMovie, setDeletingMovie] = useState(false);

  const fetchMovie = async () => {
    if (!parsedMovieId || Number.isNaN(parsedMovieId)) {
      setError('ID do filme invalido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let details: MovieDetailsType;

      try {
        const backendDetails: MovieDetailsFromBackend = await getMovieDetailsFromBackend(parsedMovieId);
        details = backendDetails;
        setRating(backendDetails.rating_user ?? 0);
        setExistsInBackend(true);
      } catch (backendError: any) {
        if (backendError?.response?.status === 404) {
          details = await getMovieDetails(parsedMovieId);
          setRating(0);
          setExistsInBackend(false);
        } else {
          throw backendError;
        }
      }

      setMovie(details);
      
      try {
        const existingRating = await getMovieRating(parsedMovieId);
        setRating(existingRating ?? 0);
      } catch (ratingError) {
        setRating(0);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes do filme.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie();
  }, [parsedMovieId]);

  const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  const handleSaveRating = async () => {
    if (!movie || !user) {
      setError('Dados de usuário ou filme não disponíveis');
      return;
    }
    
    setSavingRating(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await saveRatedMovie(movie, rating, user.id);
      
      setSuccessMessage('Nota salva com sucesso!');
      setExistsInBackend(true);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Nao foi possivel salvar a nota. Tente novamente.');
    } finally {
      setSavingRating(false);
    }
  };

  const handleDeleteMovie = async () => {
    if (!movie) return;

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir "${movie.title}" do banco de dados?`
    );

    if (!confirmDelete) return;

    setDeletingMovie(true);
    setError(null);

    try {
      await deleteMovie(parsedMovieId);
      setSuccessMessage('Filme excluído com sucesso!');
      setExistsInBackend(false);
      setRating(0);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Não foi possível excluir o filme. Tente novamente.');
    } finally {
      setDeletingMovie(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`${styles.movieDetailsPage} ${styles.homeContainer}`}>
      <PageHeader
        actions={
          <>
            <button onClick={() => navigate('/')} className={styles.btnRated}>
              Voltar para Home
            </button>
            <button onClick={() => navigate('/rated-movies')} className={styles.btnRated}>
              Filmes Avaliados
            </button>
            <button onClick={handleLogout} className={styles.btnLogout}>
              Sair
            </button>
          </>
        }
      />

      <main className={styles.homeMain}>
        <div className={styles.contentWrapper}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Carregando detalhes do filme...</p>
            </div>
          ) : null}

          {error && !loading ? (
            <div className={styles.errorState}>
              <h3>Ops! Algo deu errado</h3>
              <p>{error}</p>
              <button className={styles.btnRetry} onClick={fetchMovie}>
                Tentar novamente
              </button>
            </div>
          ) : null}

          {!loading && !error && movie ? (
            <section className={styles.movieDetailsCard}>
              <div className={styles.movieDetailsPosterWrap}>
                <img
                  className={styles.movieDetailsPoster}
                  src={getPosterUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                />
              </div>

              <div className={styles.movieDetailsContent}>
                <h1 className={styles.movieDetailsTitle}>{movie.title}</h1>
                <p className={styles.movieDetailsMeta}>
                  {releaseYear} • {movie.runtime ? `${movie.runtime} min` : 'Duracao indisponivel'}
                </p>

                {movie.tagline ? <p className={styles.movieDetailsTagline}>{movie.tagline}</p> : null}

                <div className={styles.movieDetailsGenres}>
                  {movie.genres?.map((genre) => (
                    <span key={genre.id} className={styles.movieDetailsGenrePill}>
                      {genre.name}
                    </span>
                  ))}
                </div>

                <p className={styles.movieDetailsOverview}>{movie.overview || 'Sinopse indisponivel.'}</p>

                <div className={styles.movieDetailsRatingBox}>
                  <h2>Sua avaliacao</h2>
                  <StarRating value={rating} onChange={setRating} />
                  <p className={styles.movieDetailsRatingValue}>Nota selecionada: {rating.toFixed(1)} / 5</p>
                  
                  <div className={styles.movieDetailsActions}>
                    <button
                      className={styles.btnRated}
                      onClick={handleSaveRating}
                      disabled={savingRating || rating === 0}
                    >
                      {savingRating ? 'Salvando...' : 'Salvar avaliacao'}
                    </button>
                    
                    {existsInBackend && (
                      <button
                        className={styles.btnDelete}
                        onClick={handleDeleteMovie}
                        disabled={deletingMovie}
                      >
                        {deletingMovie ? 'Excluindo...' : 'Excluir do Banco'}
                      </button>
                    )}
                  </div>
                  
                  {successMessage ? <p className={styles.movieDetailsSuccess}>{successMessage}</p> : null}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
