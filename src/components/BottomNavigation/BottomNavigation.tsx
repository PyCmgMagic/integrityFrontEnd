import { useLocation, useNavigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import styles from './BottomNavigation.module.css';

export interface NavItem {
  path: string;
  icon: ReactNode;
  label: string;
  activePattern?: string;
}

interface BottomNavigationProps {
  items: NavItem[];
  className?: string;
}

const BottomNavigation = ({ items, className = '' }: BottomNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return location.pathname.startsWith(item.activePattern);
    }
    return location.pathname === item.path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`${styles.bottomNav} ${className}`}>
      {items.map((item, index) => {
        // 动态组合类名
        const buttonClass = `${styles.navButton} ${isActive(item) ? styles.active : ''}`;

        return (
          <button
            key={`nav-item-${index}`}
            className={buttonClass}
            onClick={() => handleNavigation(item.path)}
            type="button"
            aria-label={`导航到${item.label}页面`}
          >
            <div className={styles.navIcon}>
              {item.icon}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation; 