import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Avatar } from 'antd';
import { 
  PlusOutlined, 
  CheckSquareOutlined,
  StarOutlined,
  ExportOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../store';
import BottomNavigation, { type NavItem } from './BottomNavigation/BottomNavigation';

const { Header, Sider, Content } = Layout;


const UserLayout = () => {
  // 只保留主页和个人中心
  const navItems: NavItem[] = [
    {
      path: '/user/home',
      icon: <img src="/assets/应用.png" alt="首页" className="w-5 h-5" />,
      label: '首页',
      activePattern: '/user/home'
    },
    {
      path: '/user/profile',
      icon: <UserOutlined />,
      label: '个人',
      activePattern: '/user/profile'
    }
  ];

  return (
          <Layout>
        <Content className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
      <BottomNavigation items={navItems} />
        </Content>
      </Layout>
    // <div className="phone-container">
    //   <main className="page-container">
    //     <Outlet />
    //   </main>
    //   <BottomNavigation items={navItems} />
    // </div>
  );
};

export default UserLayout; 