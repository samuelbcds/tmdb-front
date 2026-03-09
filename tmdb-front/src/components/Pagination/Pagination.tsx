import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

function getPaginationRange(currentPage: number, totalPages: number): Array<number | string> {
  const range: Array<number | string> = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) {
      range.push(i);
    }
    return range;
  }

  range.push(1);

  if (currentPage > 3) {
    range.push('...');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (currentPage < totalPages - 2) {
    range.push('...');
  }

  range.push(totalPages);

  return range;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <div className={styles.paginationPages}>
        {pages.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={`${page}-${index}`}
              className={`${styles.paginationPage} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>
              {page}
            </span>
          )
        )}
      </div>

      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
      >
        Próxima →
      </button>
    </nav>
  );
}
