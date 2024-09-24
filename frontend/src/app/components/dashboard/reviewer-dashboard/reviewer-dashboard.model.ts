import { GridModel } from '../../../shared/components/grid/grid.model';

export class ReviewerDashboardModel {
    grid: GridModel;
}

export const initializeReviewerDashboard = {
    grid: {
        cols: [],
        colsForRowSpan: [],
        requests: [],
    } as GridModel,
};
