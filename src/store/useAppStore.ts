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

interface AppState {
  activities: Activity[];
  currentActivity: Activity | null;
  currentProject: Project | null;
  currentColumn: Column | null;
  checkRecords: CheckRecord[];
  loading: boolean;
  error: string | null;
  
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
}

export const useAppStore = create<AppState>((set, get) => ({
  activities: [],
  currentActivity: null,
  currentProject: null,
  currentColumn: null,
  checkRecords: [],
  loading: false,
  error: null,

  setActivities: (activities: Activity[]) => set({ activities }),
  
  setCurrentActivity: (activity: Activity | null) => set({ currentActivity: activity }),
  
  setCurrentProject: (project: Project | null) => set({ currentProject: project }),
  
  setCurrentColumn: (column: Column | null) => set({ currentColumn: column }),
  
  setCheckRecords: (records: CheckRecord[]) => set({ checkRecords: records }),
  
  addCheckRecord: (record: CheckRecord) => {
    const { checkRecords } = get();
    set({ checkRecords: [record, ...checkRecords] });
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
})); 