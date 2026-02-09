import { create } from 'zustand';

export interface Activity {
  id: string;
  name: string;
  description: string;
  cover: string;
  startTime: string;
  endTime: string;
  projects: Project[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  cover: string;
  activityId: string;
  startTime: string;
  endTime: string;
  columns: Column[];
  createdAt: string;
}

export interface Column {
  id: string;
  name: string;
  description: string;
  cover: string;
  projectId: string;
  startTime: string;
  endTime: string;
  dailyLimit: number;
  pointsPerCheck: number;
  createdAt: string;
}

export interface CheckRecord {
  id: string;
  columnId: string;
  userId: string;
  userName: string;
  content: string;
  images: string[];
  points: number;
  status: 'pending' | 'approved' | 'rejected';
  isFavorite: boolean;
  createdAt: string;
  reviewedAt?: string;
  reviewerId?: string;
}

// 栏目创建数据接口
export interface ColumnCreationData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  start_time: string;
  end_time: string;
  coverImage?: string;
  dailyCheckinLimit: number;
  pointsPerCheckin: number;
  minWordLimit: number;
  maxWordLimit: number;
  optional: boolean;
}

interface AppState {
  activities: Activity[];
  currentActivity: Activity | null;
  currentProject: Project | null;
  currentColumn: Column | null;
  checkRecords: CheckRecord[];
  loading: boolean;
  error: string | null;
  
  // 栏目创建相关状态
  columnCreationData: Record<number, ColumnCreationData>; // 按步骤索引保存数据
  createdColumnIds: Set<number>; // 已创建的栏目步骤索引
  isCreatingColumn: boolean; // 是否正在创建栏目

  // Actions
  setActivities: (activities: Activity[]) => void;
  setCurrentActivity: (activity: Activity | null) => void;
  setCurrentProject: (project: Project | null) => void;
  setCurrentColumn: (column: Column | null) => void;
  setCheckRecords: (records: CheckRecord[]) => void;
  addCheckRecord: (record: CheckRecord) => void;
  updateCheckRecord: (id: string, updates: Partial<CheckRecord>) => void;
  deleteCheckRecord: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 栏目创建相关方法
  saveColumnData: (stepIndex: number, data: ColumnCreationData) => void;
  getColumnData: (stepIndex: number) => ColumnCreationData | null;
  markColumnAsCreated: (stepIndex: number) => void;
  isColumnCreated: (stepIndex: number) => boolean;
  clearColumnCreationData: () => void;
  setIsCreatingColumn: (isCreating: boolean) => void;
  getAllColumnData: () => Record<number, ColumnCreationData>;
  isAllColumnDataSaved: (totalSteps: number) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  activities: [],
  currentActivity: null,
  currentProject: null,
  currentColumn: null,
  checkRecords: [],
  loading: false,
  error: null,
  
  // 栏目创建相关状态初始化
  columnCreationData: {},
  createdColumnIds: new Set(),
  isCreatingColumn: false,

  setActivities: (activities: Activity[]) => set({ activities }),

  setCurrentActivity: (activity: Activity | null) => set({ currentActivity: activity }),

  setCurrentProject: (project: Project | null) => set({ currentProject: project }),

  setCurrentColumn: (column: Column | null) => set({ currentColumn: column }),

  setCheckRecords: (records: CheckRecord[]) => set({ checkRecords: records }),

  addCheckRecord: (record: CheckRecord) => {
    const { checkRecords } = get();
    set({ checkRecords: [...checkRecords, record] });
  },

  updateCheckRecord: (id: string, updates: Partial<CheckRecord>) => {
    const { checkRecords } = get();
    const updatedRecords = checkRecords.map(record => 
      record.id === id ? { ...record, ...updates } : record
    );
    set({ checkRecords: updatedRecords });
  },

  deleteCheckRecord: (id: string) => {
    const { checkRecords } = get();
    const filteredRecords = checkRecords.filter(record => record.id !== id);
    set({ checkRecords: filteredRecords });
  },

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),
  
  // 栏目创建相关 Actions 实现
  /**
   * 保存栏目数据到指定步骤
   * @param stepIndex - 步骤索引
   * @param data - 栏目数据
   */
  saveColumnData: (stepIndex: number, data: ColumnCreationData) => {
    const { columnCreationData } = get();
    set({ 
      columnCreationData: {
        ...columnCreationData,
        [stepIndex]: data
      }
    });
  },
  
  /**
   * 获取指定步骤的栏目数据
   * @param stepIndex - 步骤索引
   * @returns 栏目数据或null
   */
  getColumnData: (stepIndex: number) => {
    const { columnCreationData } = get();
    return columnCreationData[stepIndex] || null;
  },
  
  /**
   * 标记栏目为已创建
   * @param stepIndex - 步骤索引
   */
  markColumnAsCreated: (stepIndex: number) => {
    const { createdColumnIds } = get();
    const newCreatedIds = new Set(createdColumnIds);
    newCreatedIds.add(stepIndex);
    set({ createdColumnIds: newCreatedIds });
  },
  
  /**
   * 检查栏目是否已创建
   * @param stepIndex - 步骤索引
   * @returns 是否已创建
   */
  isColumnCreated: (stepIndex: number) => {
    const { createdColumnIds } = get();
    return createdColumnIds.has(stepIndex);
  },
  
  /**
   * 清除所有栏目创建数据
   */
  clearColumnCreationData: () => {
    set({ 
      columnCreationData: {},
      createdColumnIds: new Set(),
      isCreatingColumn: false
    });
  },
  
  /**
   * 设置是否正在创建栏目状态
   * @param isCreating - 是否正在创建
   */
  setIsCreatingColumn: (isCreating: boolean) => {
    set({ isCreatingColumn: isCreating });
  },
  
  /**
   * 获取所有已保存的栏目数据
   * @returns 所有栏目数据数组
   */
  getAllColumnData: () => {
    const { columnCreationData } = get();
    return Object.values(columnCreationData);
  },
  
  /**
   * 检查是否所有步骤的数据都已保存
   * @param totalSteps - 总步骤数
   * @returns 是否所有数据都已保存
   */
  isAllColumnDataSaved: (totalSteps: number) => {
    const { columnCreationData } = get();
    for (let i = 1; i <= totalSteps; i++) {
      if (!columnCreationData[i]) {
        return false;
      }
    }
    return true;
  },
}));
