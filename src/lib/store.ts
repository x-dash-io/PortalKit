import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Projects Store
interface Project {
    _id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    status: string;
    updatedAt: string;
    filesCount?: number;
    invoicesCount?: number;
    approvalsCount?: number;
}

interface ProjectsState {
    projects: Project[];
    activeProject: Project | null;
    setProjects: (projects: Project[]) => void;
    setActiveProject: (project: Project | null) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
    projects: [],
    activeProject: null,
    setProjects: (projects) => set({ projects }),
    setActiveProject: (project) => set({ activeProject: project }),
}));

// UI Store
interface UIState {
    sidebarOpen: boolean;
    unreadNotifications: number;
    setSidebarOpen: (open: boolean) => void;
    setUnreadNotifications: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    unreadNotifications: 0,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}));

// Re-export theme store for convenience
export { useThemeStore } from './store/useThemeStore';
