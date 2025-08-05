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

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const navItems: NavItem[] = [
    {
      path: '/admin/home',
      icon: <img src="/assets/应用.png" alt="首页" className="w-5 h-5" />,
      label: '首页',
      activePattern: '/admin/home'
    },
    {
      path: '/admin/manage',
      icon: <img src='/assets/审核白色.png' alt='审核' className='w-5 h-5 inline-block' />,
      label: '审核', 
      activePattern: '/admin/manage'
    },
    {
      path: '/admin/profile',
      icon: <UserOutlined />,
      label: '个人',
      activePattern: '/admin/profile'
    }
  ];

  const menuItems = [
    { key: '/admin/home', icon: <img src="/assets/应用.png" alt="首页" className="w-5 h-5 inline-block" />, label: '首页' },
    { key: '/admin/manage', icon: <CheckSquareOutlined />, label: '审核管理' },
    { key: '/admin/favorites', icon: <StarOutlined />, label: '我的收藏' },
    { key: '/admin/export', icon: <ExportOutlined />, label: '导出数据' },
    {
      key: 'create',
      icon: <PlusOutlined />,
      label: '创建',
      children: [
        { key: '/admin/create/activity', label: '创建活动' },
        { key: '/admin/create/project', label: '创建项目' },
        { key: '/admin/create/column', label: '创建栏目' },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (drawerVisible) {
      setDrawerVisible(false); // 点击后关闭抽屉
    }
  };

  const MenuContent = () => (
    <>
      <div className="p-6 text-center border-b border-white/20">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-xl font-bold">智</span>
        </div>
        <h2 className="text-white font-bold text-lg">智打卡管理端</h2>
        <p className="text-white/80 text-sm mt-1">Campus Check-in Admin</p>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['create']}
        items={menuItems}
        onClick={handleMenuClick}
        className="mt-4"
      />
    </>
  );

  return (
    <Layout className="min-h-screen admin-layout">
      {/* 桌面端侧边栏 */}
      <Sider width={240} className="shadow-lg hidden md:block">
        <MenuContent />
      </Sider>

      {/* 移动端抽屉 */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0, background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' }}
        className="md:hidden"
        width={240}
      >
        <MenuContent />
      </Drawer>

      <Layout>
        <Header className="px-4 md:px-6 flex justify-between items-center">
          <Button
            type="text"
            icon={<MenuOutlined className="text-lg" />}
            onClick={() => setDrawerVisible(true)}
            className="md:hidden"
          />
          <h1 className="text-lg md:text-xl font-bold text-gray-800 m-0 hidden md:block">
            智打卡·校园行
          </h1>
          <div className="flex items-center space-x-4">
            <Avatar icon={<UserOutlined />} src={user?.avatar} />
            <span className="text-gray-600 hidden sm:inline">{user?.name}</span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              className="modern-btn"
            >
              <span className="hidden sm:inline">退出登录</span>
            </Button>
          </div>
        </Header>
        <Content className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
      <BottomNavigation items={navItems} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;