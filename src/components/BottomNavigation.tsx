import { useLocation, useNavigate } from 'react-router-dom';
import { type ReactNode } from 'react';

/**
 * 导航项配置接口
 */
export interface NavItem {
  path: string;          // 导航路径
  icon: ReactNode;       // 图标组件
  label: string;         // 用于 aria-label 的可访问性标签
  activePattern?: string; // 可选的活跃路径匹配模式，支持前缀匹配
}

interface BottomNavigationProps {
  items: NavItem[];      // 导航项数组
  className?: string;    // 自定义样式类名
}

/**
 * 底部导航栏组件
 * 
 * @example
 * ```tsx
 * import { HomeOutlined, UserOutlined } from '@ant-design/icons';
 * import BottomNavigation, { type NavItem } from './BottomNavigation';
 * 
 * const navItems: NavItem[] = [
 *   {
 *     path: '/home',
 *     icon: <HomeOutlined />,
 *     label: '首页',
 *     activePattern: '/home'
 *   },
 *   {
 *     path: '/profile',
 *     icon: <UserOutlined />,
 *     label: '个人',
 *     activePattern: '/profile'
 *   }
 * ];
 * 
 * <BottomNavigation items={navItems} />
 * ```
 */
const BottomNavigation = ({ items, className = '' }: BottomNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * 判断导航项是否为活跃状态
   * @param item 导航项
   * @returns 是否活跃
   */
  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return location.pathname.startsWith(item.activePattern);
    }
    return location.pathname === item.path;
  };

  /**
   * 处理导航点击
   * @param path 目标路径
   */
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`bottom-nav ${className}`}>
      {items.map((item, index) => (
        <button
          key={`nav-item-${index}`}
          className={isActive(item) ? 'active' : ''}
          onClick={() => handleNavigation(item.path)}
          type="button"
          aria-label={`导航到${item.label}页面`}
        >
          <div className="nav-icon">
            {item.icon}
          </div>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation; 