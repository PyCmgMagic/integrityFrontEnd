import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import ProtectedRoute from '../components/ProtectedRoute';
import CheckInDetail from '../pages/Admin/ColumnManage/CheckInDetail';

// 懒加载页面组件
const LoginPage = lazy(() => import('../pages/Login/index'));

// 用户端页面
const UserLayout = lazy(() => import('../components/UserLayout'));
const UserHome = lazy(() => import('../pages/User/Home/index'));
const ActivityDetail = lazy(() => import('../pages/User/ActivityDetail/index'));
const ProjectDetail = lazy(() => import('../pages/User/ProjectDetail/index'));
const ColumnPage = lazy(() => import('../pages/User/ColumnPage/index'));
const PunchPage = lazy(() => import('../pages/User/PunchPage/index'));
const EditPunchPage = lazy(() => import('../pages/User/EditPunchPage/index'));
const UserProfile = lazy(() => import('../pages/User/Profile/index'));

// 管理端页面
const AdminLayout = lazy(() => import('../components/AdminLayout'));
const AdminHome = lazy(() => import('../pages/Admin/Home/index'));
const CreateActivity = lazy(() => import('../pages/Admin/CreateActivity/index'));
const CreateNewProject = lazy(() => import('../pages/Admin/CreateProject/index'));
const CreateColumnFlow = lazy(() => import('../pages/Admin/CreateColumn/CreateColumnFlow'));
const CreateColumn = lazy(() => import('../pages/Admin/CreateColumn/index'));
const SuccessPage = lazy(() => import('../pages/Admin/Success/index'));
const ReviewManage = lazy(() => import('../pages/Admin/ReviewManage/index'));
const ActivityManage = lazy(() => import('../pages/Admin/ActivityManage/index'));
const ProjectManage = lazy(() => import('../pages/Admin/ProjectManage/index'));
const ColumnManage = lazy(() => import('../pages/Admin/ColumnManage/index'));
const ReviewDetail = lazy(() => import('../pages/Admin/ReviewDetail/index'));
const Favorites = lazy(() => import('../pages/Admin/Favorites/index'));
const ExportData = lazy(() => import('../pages/Admin/ExportData/index'));

// 加载组件
const LoadingComponent = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Spin size="large" />
  </div>
);

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/user',
    element: (
      <ProtectedRoute requiredRole="user">
        <Suspense fallback={<LoadingComponent />}>
          <UserLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/user/home" replace />,
      },
      {
        path: 'home',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <UserHome />
          </Suspense>
        ),
      },     
      {
        path: 'activity/:activityId/project/:projectId/column/:columnId',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ColumnPage />
          </Suspense>
        ),
      },
      {
        path: 'activity/:activityId/project/:projectId',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ProjectDetail />
          </Suspense>
        ),
      },
      {
        path: 'activity/:id',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ActivityDetail />
          </Suspense>
        ),
      },
  
      {
        path: 'punch/:id',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <PunchPage />
          </Suspense>
        ),
      },
      {
        path: 'edit/:id',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <EditPunchPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <UserProfile />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <Suspense fallback={<LoadingComponent />}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/home" replace />,
      },
      {
        path: 'home',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <AdminHome />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: 'create/activity',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <CreateActivity />
          </Suspense>
        ),
      },
      {
        path: 'create/activity/:activityId/project',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <CreateNewProject />
          </Suspense>
        ),
      },
      {
        path: 'create/activity/:activityId/project/:projectId/column/:columnIndex',
        element: (
          <Suspense fallback={<LoadingComponent />}>
           <CreateColumnFlow /> 
          </Suspense>
        ),
      },
      {
        path: 'create/activity/:activityId/project/:projectId/success',
        element: (
          <Suspense fallback={<LoadingComponent />}>
           <SuccessPage /> 
          </Suspense>
        ),
      },
      {
        path: 'manage',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ReviewManage />
          </Suspense>
        ),
      },
      {
        path: 'activity/:id',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ActivityManage />
          </Suspense>
        ),
      },
      {
        path: 'activity/:activityId/project/:projectId',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ProjectManage />
          </Suspense>
        ),
      },
      {
        path: 'activity/:activityId/project/:projectId/column/:columnId',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ColumnManage />
          </Suspense>
        ),
      },
      {
        path: 'activity/:activityId/project/:projectId/column/:columnId/review/:reviewId',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <CheckInDetail />
          </Suspense>
        ),
      },
      {
        path: 'review/:id',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ReviewDetail />
          </Suspense>
        ),
      },
      {
        path: 'favorites',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <Favorites />
          </Suspense>
        ),
      },
      {
        path: 'export',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ExportData />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);