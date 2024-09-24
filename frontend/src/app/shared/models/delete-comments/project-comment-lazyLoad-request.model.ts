import { FilterModel } from '../filter/filter-request.model';
import { SortModel } from '../utility/sort-request.model';

export interface ProjectCommentLazyLoadRequestModel {
    projectId: number;
    userId?: number;
    filter?: FilterModel[];
    sort?: SortModel;
}
