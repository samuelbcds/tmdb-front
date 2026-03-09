import styles from './MovieFilters.module.css';

interface MovieFiltersProps {
  yearValue: string;
  genreValue: string;
  onYearChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  className?: string;
}

export function MovieFilters({
  yearValue,
  genreValue,
  onYearChange,
  onGenreChange,
  className,
}: MovieFiltersProps) {
  return (
    <div className={`${styles.filtersRow} ${className || ''}`.trim()}>
      <div className={styles.filterControl}>
        <label htmlFor="year-filter" className={styles.filterLabel}>
          Ano de lancamento
        </label>
        <input
          id="year-filter"
          placeholder="Ex: 2024"
          className={styles.filterInput}
          value={yearValue}
          onChange={(event) => onYearChange(event.target.value)}
        />
      </div>

      <div className={styles.filterControl}>
        <label htmlFor="genre-filter" className={styles.filterLabel}>
          Genero
        </label>
        <input
          id="genre-filter"
          type="text"
          placeholder="Ex: Acao"
          className={styles.filterInput}
          value={genreValue}
          onChange={(event) => onGenreChange(event.target.value)}
        />
      </div>
    </div>
  );
}
