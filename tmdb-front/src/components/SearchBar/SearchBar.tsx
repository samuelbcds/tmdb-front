import SearchIcon from '../../assets/icons/search-alt-svgrepo-com.svg?react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Digite o nome do filme...',
  ariaLabel = 'Buscar filmes',
}: SearchBarProps) {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <span className={styles.searchIcon}>
          <SearchIcon style={{width: '20px', height:'20px'}} />
        </span>
        <input
          name='search'
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel}
        />
        {value ? (
          <button className={styles.clearButton} onClick={onClear} aria-label="Limpar busca">
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}
