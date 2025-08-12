import React, { useState } from 'react';
import { Card, Typography, Avatar, Tabs, List, Button, message, Empty } from 'antd';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
import { EditOutlined, CalendarOutlined, StarOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

// 导入组件
import { 
  EditProfileModal, 
  CreateActivityModal, 
  ExportDataModal
} from '../../../components';
import type { ActivityData } from '../../../types/types';


import type { UserProfile, CheckInData, ActivityHistoryData } from '../../../types/types';

// 收藏的打卡信息类型
interface FavoriteData {
  id: number;
  title: string;
  description: string;
  date: string;
}

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 为初始数据应用类型
const initialCheckInData: CheckInData[] = [
  { id: 1, title: '寒假打卡-“瑞蛇衔知”，勤学善知-自习打卡', time: '第14次打卡', date: '1.19' },
  { id: 2, title: '寒假打卡-“瑞蛇衔知”，勤学善知-单词打卡', time: '第13次打卡', date: '1.18' },
  { id: 3, title: '寒假打卡-“瑞蛇衔知”，勤学善知-自习打卡', time: '第12次打卡', date: '1.18' },
  { id: 4, title: '寒假打卡-“瑞蛇衔知”，勤学善知-单词打卡', time: '第11次打卡', date: '1.17' },
];

const activityHistoryData: ActivityHistoryData[] = [
    { id: 1, type: 'join', title: '参加了 "编程马拉松" 活动', date: '12-25' },
    { id: 2, type: 'post', title: '在 "校园摄影展" 中发布了新照片', date: '12-20' },
    { id: 3, type: 'join', title: '报名了 "学期总结分享会"', date: '12-15' },
];

// 收藏的打卡信息初始数据
const initialFavoriteData: FavoriteData[] = [
  { id: 1, title: '每日单词打卡', description: '每天学习20个新单词，提高英语词汇量', date: '2023-12-20' },
  { id: 2, title: '晨跑打卡', description: '每天早晨6点跑步3公里，保持健康生活方式', date: '2023-12-18' },
];

const ProfilePage: React.FC = () => {
  // 使用 UserProfile 类型来定义 user state
  const [user, setUser] = useState<UserProfile>({
    name: 'PyCmg',
    avatar: '/assets/avatar.jpg',
    bio: '个人描述',
    studentId: '20210001',
    grade: '2024级',
    college: '软件学院',
    major: '软件工程',
    dob: '2006-01-01',
    gender: '男',
  });
 
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isExportDataModalVisible, setIsExportDataModalVisible] = useState<boolean>(false);
  const [checkInData, setCheckInData] = useState<CheckInData[]>(initialCheckInData);
  const [favoriteData, setFavoriteData] = useState<FavoriteData[]>(initialFavoriteData);

  const showEditModal = () => setIsEditModalVisible(true);
  const handleModalCancel = () => setIsEditModalVisible(false);

  const handleModalSave = (updatedData: UserProfile) => {
    setUser(updatedData);
    setIsEditModalVisible(false);
    Toast.show({ content: '个人信息已更新', position: 'bottom' });
  };


  // 显示导出数据模态框
  const showExportDataModal = () => {
    setIsExportDataModalVisible(true);
  };

  // 隐藏导出数据模态框
  const hideExportDataModal = () => {
    setIsExportDataModalVisible(false);
  };

  // 处理导出数据
  const handleExportData = (exportOptions: any) => {
    // 模拟导出过程
    message.loading('正在导出数据...', 1.5)
      .then(() => {
        console.log('导出选项:', exportOptions);
        message.success('活动数据已导出');
        setIsExportDataModalVisible(false);
      });
  };

  // 取消收藏的处理函数
  const handleRemoveFavorite = (id: number) => {
    setFavoriteData(prevData => prevData.filter(item => item.id !== id));
    message.success('已取消收藏');
  };

  const rightActions = (id: number) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger' as const, // antd-mobile 需要一个常量类型
      onClick: async () => {
        const result = await Dialog.confirm({
          content: '确定要删除这条打卡记录吗？',
          confirmText: '确认',
          cancelText: '取消',
        });
        if (result) {
          setCheckInData(prevData => prevData.filter(item => item.id !== id));
          Toast.show({ content: '删除成功', position: 'bottom' });
        }
      },
    },
  ];

  return (
    <>
      <div className="bg-gray-50 min-h-screen font-sans pb-12 p-1">
        <div className="max-w-2xl mx-auto">
          {/* 用户信息卡片 */}
          <Card className="rounded-2xl shadow-lg border-1 border-gray-200 mb-4 bg-white">
            <div className="flex flex-col items-center p-4">
              <div className="relative mb-3">
                <Avatar size={100} src={user.avatar} className="border-2 border-gray-300"/>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-md flex items-center justify-center border-1 border-black cursor-pointer bg-white hover:bg-gray-100 transition-colors" onClick={showEditModal}>
                  <EditOutlined />
                </div>
              </div>
              <Title level={3} className="mt-2 mb-1 font-bold">{user?.name}</Title>
              <Text type="secondary">{user?.bio}</Text>
            </div>
          </Card>
          
          {/* 打卡与活动历史 */}
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <Tabs defaultActiveKey="1" centered size="large">
              <TabPane tab="我创建的活动" key="1">
                <div className="p-4 pt-0">
                  {checkInData.map((item, index) => (
                    <SwipeAction
                      key={item.id}
                      style={{ ['--adm-swipe-action-actions-border-radius' as string]: '0.75rem' }}
                      rightActions={rightActions(item.id)}
                      className={index === checkInData.length - 1 ? '' : 'mb-3'}
                    >
                      <div className="w-full bg-blue-50 rounded-xl p-4 transition-all hover:bg-blue-100 hover:shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div>
                                <Text strong className="text-gray-800">{item.title}</Text>
                                <div className="flex justify-between items-center mt-1">
                                  <p className="text-gray-500 text-sm m-0">{item.time}</p> 
                                  <Text type="secondary" className="font-semibold ml-4">{item.date}</Text>
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwipeAction>
                  ))}
                </div>
              </TabPane>
              <TabPane tab="导出活动数据" key="2">
                <div className="p-4 pt-0">
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    className="mb-4 bg-green-500 hover:bg-green-600" 
                    onClick={showExportDataModal}
                  >
                    导出数据
                  </Button>
                  <List
                    className="mt-2"
                    dataSource={activityHistoryData}
                    renderItem={(item) => (
                     <List.Item key={item.id} className="border-0 px-0 py-2">
                      <div className="w-full bg-gray-50 rounded-xl p-4 transition-all hover:bg-gray-100 hover:shadow-md">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center">
                              <CalendarOutlined className="text-purple-500 mr-4 text-xl" />
                              <Text className="text-gray-700">{item.title}</Text>
                           </div>
                           <Text type="secondary">{item.date}</Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                  />
                </div>
              </TabPane>
              <TabPane tab="我的收藏" key="3">
                <div className="p-4 pt-0">
                  {favoriteData.length > 0 ? (
                    <List
                      dataSource={favoriteData}
                      renderItem={(item) => (
                        <List.Item key={item.id} className="border-0 px-0 py-2">
                          <div className="w-full bg-yellow-50 rounded-xl p-4 transition-all hover:bg-yellow-100 hover:shadow-md">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <StarOutlined className="text-yellow-500 mr-4 text-xl" />
                                <div>
                                  <Text strong className="text-gray-800">{item.title}</Text>
                                  <div className="mt-1">
                                    <Text type="secondary">{item.description}</Text>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Text type="secondary">{item.date}</Text>
                                <Button 
                                  type="text" 
                                  danger 
                                  size="small" 
                                  className="mt-2"
                                  onClick={() => handleRemoveFavorite(item.id)}
                                >
                                  取消收藏
                                </Button>
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无收藏" />
                  )}
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* 渲染模态框组件 */}
      <EditProfileModal
        visible={isEditModalVisible}
        onCancel={handleModalCancel}
        onSave={handleModalSave}
        currentUser={user}
      />



      {/* 导出数据模态框 */}
      <ExportDataModal
        visible={isExportDataModalVisible}
        onCancel={hideExportDataModal}
        onExport={handleExportData}
      />
    </>
  );
};

export default ProfilePage;