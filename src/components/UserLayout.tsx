import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { 
  UserOutlined
} from '@ant-design/icons';
import BottomNavigation, { type NavItem } from './BottomNavigation/BottomNavigation';
const { Content } = Layout;
const UserLayout = () => {
  // 直接从localStorage计算isAdmin状态，避免无限重渲染
  const role = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const isAdmin = role?.state?.user?.role_id === 1;
  console.log(role);
  const userNavItems: NavItem[] = [
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
  const adminNavItems: NavItem[] = [
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
  return (
          <Layout>
        <Content className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
      <BottomNavigation items={isAdmin ? adminNavItems : userNavItems} />
        </Content>
      </Layout>
  );
};

export default UserLayout;