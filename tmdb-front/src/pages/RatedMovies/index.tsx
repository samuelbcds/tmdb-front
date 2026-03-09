import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { type Movie } from '../../services/tmdbService';
import { getRatedMovies } from '../../services/ratingService';
import { MovieFilters, MovieGrid, PageHeader, Pagination, SearchBar } from '../../components';
import styles from './styles.module.css';

export default function RatedMovies() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const debouncedGenreFilter = useDebounce(genreFilter, 400);

  const fetchRatedMovies = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const normalizedYear = yearFilter.trim();
      const parsedYear = normalizedYear.length === 4 ? Number(normalizedYear) : undefined;

      if (parsedYear !== undefined && (parsedYear < 1800 || parsedYear > 2100)) {
        setError('Ano invalido. Use um valor entre 1800 e 2100.');
        setRatedMovies([]);
        setTotalPages(0);
        setTotalResults(0);
        return;
      }

      const response = await getRatedMovies({
        search: debouncedSearchQuery.trim() || undefined,
        year: parsedYear,
        genre: debouncedGenreFilter.trim() || undefined,
        page,
        per_page: 20,
      });

      setRatedMovies(response.movies);
      setTotalPages(response.pagination.pages);
      setTotalResults(response.pagination.total);
    } catch (err: any) {
      console.error('Erro ao buscar filmes avaliados:', err);
      setError(err.message || 'Nao foi possivel carregar os filmes avaliados.');
      setRatedMovies([]);
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedGenreFilter, debouncedSearchQuery, yearFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, debouncedGenreFilter, yearFilter]);

  useEffect(() => {
    fetchRatedMovies(currentPage);
  }, [currentPage, fetchRatedMovies]);

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
              }}
              onClear={() => {
                setSearchQuery('');
              }}
              placeholder="Buscar entre filmes avaliados..."
              ariaLabel="Buscar filmes avaliados"
            />

            <MovieFilters
              yearValue={yearFilter}
              genreValue={genreFilter}
              onYearChange={setYearFilter}
              onGenreChange={setGenreFilter}
            />

            {!loading && !error ? (
              <div className={styles.resultsInfo}>
                <p>
                  Encontrados <strong>{totalResults}</strong> resultado{totalResults !== 1 ? 's' : ''}
                </p>
              </div>
            ) : null}
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
              <button className={styles.btnRetry} onClick={() => fetchRatedMovies(currentPage)}>
                Tentar novamente
              </button>
            </div>
          ) : null}

          {!loading && !error && ratedMovies.length > 0 ? (
            <>
              <MovieGrid
                movies={ratedMovies}
                onMovieClick={(movie) => navigate(`/movies/${movie.id}`)}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : null}

          {!loading && !error && ratedMovies.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>Nenhum filme encontrado</h3>
              <p>Ajuste os filtros ou avalie novos filmes.</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
