import { Outlet } from 'react-router-dom';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import BottomNavigation, { type NavItem } from './BottomNavigation/BottomNavigation';

const UserLayout = () => {
  // 只保留主页和个人中心
  const navItems: NavItem[] = [
    {
      path: '/user/home',
      icon: <HomeOutlined />,
      label: '首页',
      activePattern: '/user'
    },
    {
      path: '/user/profile',
      icon: <UserOutlined />,
      label: '个人',
      activePattern: '/user/profile'
    }
  ];

  return (
    <div className="phone-container">
      <main className="page-container">
        <Outlet />
      </main>
      <BottomNavigation items={navItems} />
    </div>
  );
};

export default UserLayout;