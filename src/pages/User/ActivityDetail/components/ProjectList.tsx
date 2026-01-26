import React from 'react';
import { Button } from 'antd';
import ProjectIcon from '../../../../components/ProjectIcon';

/**
 * 项目数据接口
 */
interface Project {
  /** 项目ID */
  id: number;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 项目图标名称 */
  avatar: string;
}

/**
 * ProjectList组件的属性接口
 */
interface ProjectListProps {
  /** 项目列表数据 */
  projects: Project[];
  /** 项目卡片点击事件 */
  onProjectClick: (projectId: number) => void;
}

/**
 * ProjectList组件 - 打卡项目列表
 * 包含打卡项目列表的显示和交互
 */
const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick
}) => {
  /**
   * 生成项目卡片的渐变色
   * @param index 项目索引
   * @returns 渐变色类名
   */
  const getProjectGradient = (index: number): string => {
    const gradients = [
      'from-orange-500 to-red-500',
      'from-amber-500 to-orange-500',
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-700 px-2">打卡项目</h3>
      {projects.length > 0 ? (
        projects.map((project, index) => (
          <div 
            key={project.id} 
            className={`bg-gradient-to-r ${getProjectGradient(index)} p-6 rounded-2xl shadow-lg flex items-center justify-between h-32`}
          >
            <div className="flex items-center">
              <div className="mr-4 bg-white/20 p-3 rounded-full">
                <ProjectIcon name={project.avatar} className="text-4xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{project.name}</h2>
                <p className="text-gray-100 text-sm h-10 overflow-hidden line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>
            <Button
              shape="round"
              className="bg-white text-red-500 font-bold border-none hover:bg-white/90"
              onClick={() => onProjectClick(project.id)}
            >
              去打卡
            </Button>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">暂无打卡项目</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
export type { Project };
