import { ProjectCommentLazyLoadRequestModel } from './project-comment-lazyLoad-request.model';
export interface DeleteCommentsRequestModel extends ProjectCommentLazyLoadRequestModel {
    ids?: number[];
    isSelectAll?: boolean;
}
