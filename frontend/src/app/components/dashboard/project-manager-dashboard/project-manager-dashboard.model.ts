import { TranslationRequestGridModel } from './components/grid/translation-request-grid.model';

export interface ProjectManagerDashboardModel {
    grid: TranslationRequestGridModel;
}

export const initializeProjectManagerDashboard: ProjectManagerDashboardModel = {
    grid: {
        projects: [],
        colsForExpandedRow: [],
    },
};

export type Role = 'editor' | 'TM' | 'PM';
