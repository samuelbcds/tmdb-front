import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className={styles.homeHeader}>
      <div className={styles.headerContent}>
        <div>
          {title ? <h1 className={styles.mainTitle}>{title}</h1> : null}
          {subtitle ? <p className={styles.mainSubtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </div>
    </header>
  );
}
