import { Outlet} from 'react-router-dom';
import { Layout } from 'antd';
import { 
  UserOutlined
} from '@ant-design/icons';
import BottomNavigation, { type NavItem } from './BottomNavigation/BottomNavigation';

const { Content } = Layout;

const AdminLayout = () => {
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
  return (
      <Layout>
        <Content className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
      <BottomNavigation items={navItems} />
        </Content>
      </Layout>
  );
};

export default AdminLayout;