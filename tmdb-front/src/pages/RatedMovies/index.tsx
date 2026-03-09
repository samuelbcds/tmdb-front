import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { type Movie } from '../../services/tmdbService';
import { getRatedMovies } from '../../services/ratingService';
import { MovieGrid, PageHeader, Pagination, SearchBar } from '../../components';
import styles from './styles.module.css';

export default function RatedMovies() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const fetchRatedMovies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ratedMoviesData = await getRatedMovies();
      setRatedMovies(ratedMoviesData); 
    } catch (err: any) {
      console.error('Erro ao buscar filmes avaliados:', err);
      setError(err.message || 'Nao foi possivel carregar os filmes avaliados.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchRatedMovies();
  }, [fetchRatedMovies]);

  const filteredMovies = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();

    if (!query) {
      return ratedMovies;
    }

    return ratedMovies.filter((movie) => movie.title.toLowerCase().includes(query));
  }, [debouncedSearchQuery, ratedMovies]);

  const pageSize = 20;
  const totalPages = Math.ceil(filteredMovies.length / pageSize);
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredMovies.slice(start, end);
  }, [currentPage, filteredMovies]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.ratedMoviesContainer}>
      <PageHeader
        actions={
          <>
            <button onClick={handleGoHome} className={styles.btnRated}>
              Voltar para Home
            </button>
            <button onClick={handleLogout} className={styles.btnLogout}>
              Sair
            </button>
          </>
        }
      />

      <main className={styles.homeMain}>
        <div className={`${styles.contentWrapper} ${styles.ratedMoviesContent}`}>
          <section className={styles.searchSection}>
            <h1 className={styles.mainTitle}>Filmes Avaliados</h1>
            <p className={styles.mainSubtitle}>Busque entre os filmes que voce avaliou</p>

            <SearchBar
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              onClear={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              placeholder="Buscar entre filmes avaliados..."
              ariaLabel="Buscar filmes avaliados"
            />
          </section>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Carregando seus filmes avaliados...</p>
            </div>
          ) : null}

          {error && !loading ? (
            <div className={styles.errorState}>
              <h3>Ops! Algo deu errado</h3>
              <p>{error}</p>
              <button className={styles.btnRetry} onClick={fetchRatedMovies}>
                Tentar novamente
              </button>
            </div>
          ) : null}

          {!loading && !error && paginatedMovies.length > 0 ? (
            <>
              <MovieGrid
                movies={paginatedMovies}
                onMovieClick={(movie) => navigate(`/movies/${movie.id}`)}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : null}

          {!loading && !error && paginatedMovies.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎬</div>
              <h3>Nenhum filme avaliado ainda</h3>
              <p>Comece a avaliar filmes para ve-los aqui.</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
