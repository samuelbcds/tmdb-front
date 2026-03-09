import { useState } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  className = '',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(value);
  const displayValue = hoverValue ?? 0;

  return (
    <div
      className={`${styles.starRating} ${className}`.trim()}
      aria-label={`Nota ${displayValue.toFixed(1)} de ${max}`}
      onMouseLeave={() => setHoverValue(value)}
    >
      {Array.from({ length: max }).map((_, idx) => {
        const starNumber = idx + 1;
        const fill = Math.max(0, Math.min(1, displayValue - idx));

        return (
          <div className={styles.starWrapper} key={starNumber}>
            <span className={styles.starBase}>☆</span>
            <span className={styles.starFill} style={{ width: `${fill * 100}%` }}>
              <span className={styles.starFillIcon}>★</span>
            </span>

            {!readOnly ? (
              <>
                <button
                  type="button"
                  className={`${styles.starHitbox} ${styles.starHitboxLeft}`}
                  onClick={() => onChange?.(starNumber - 0.5)}
                  onMouseEnter={() => setHoverValue(starNumber - 0.5)}
                  aria-label={`Dar nota ${starNumber - 0.5}`}
                />
                <button
                  type="button"
                  className={`${styles.starHitbox} ${styles.starHitboxRight}`}
                  onClick={() => onChange?.(starNumber)}
                  onMouseEnter={() => setHoverValue(starNumber)}
                  aria-label={`Dar nota ${starNumber}`}
                />
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
