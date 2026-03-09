import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { searchMovies, getPopularMovies, type Movie } from '../../services/tmdbService';
import { useDebounce } from '../../hooks/useDebounce';
import { MovieGrid, PageHeader, Pagination, SearchBar } from '../../components';
import styles from './styles.module.css';

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchMovies = useCallback(async (query: string, page: number) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (query.trim()) {
        // Search mode
        response = await searchMovies(query, page);
        setIsSearchMode(true);
      } else {
        // Popular movies mode
        response = await getPopularMovies(page);
        setIsSearchMode(false);
      }

      setMovies(response.results);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar filmes. Tente novamente.');
      setMovies([]);
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1); 
    fetchMovies(debouncedSearchQuery, 1);
  }, [debouncedSearchQuery, fetchMovies]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchMovies(debouncedSearchQuery, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigateToRated = () => {
    navigate('/rated-movies');
  };

  return (
    <div className={styles.homeContainer}>
      <PageHeader
        actions={
          <>
            <button onClick={handleNavigateToRated} className={styles.btnRated}>
              Filmes Avaliados
            </button>
            <button onClick={handleLogout} className={styles.btnLogout}>
              Sair
            </button>
          </>
        }
      />

      {/* Main content */}
      <main className={styles.homeMain}>
        <div className={styles.contentWrapper}>
          {/* Search section */}
          <section className={styles.searchSection}>
            <h1 className={styles.mainTitle}>Buscar Filmes</h1>
            <p className={styles.mainSubtitle}>
              Pesquise por título ou navegue pelos filmes populares
            </p>
            
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />

            {/* Results info */}
            {!loading && !error && (
              <div className={styles.resultsInfo}>
                {isSearchMode ? (
                  <p>
                    Encontrados <strong>{totalResults}</strong> resultado{totalResults !== 1 ? 's' : ''} 
                    {searchQuery && ` para "${searchQuery}"`}
                  </p>
                ) : (
                  <p>Mostrando filmes populares</p>
                )}
              </div>
            )}
          </section>

          {/* Loading state */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Carregando filmes...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className={styles.errorState}>
              <h3>Ops! Algo deu errado</h3>
              <p>{error}</p>
              <button 
                onClick={() => fetchMovies(debouncedSearchQuery, currentPage)}
                className={styles.btnRetry}
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Movies grid */}
          {!loading && !error && movies.length > 0 && (
            <>
              <MovieGrid
                movies={movies}
                onMovieClick={(movie) => navigate(`/movies/${movie.id}`)}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {/* Empty state */}
          {!loading && !error && movies.length === 0 && searchQuery && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎬</div>
              <h3>Nenhum filme encontrado</h3>
              <p>Tente buscar com outros termos</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
