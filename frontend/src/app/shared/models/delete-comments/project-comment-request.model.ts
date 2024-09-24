import { ProjectCommentLazyLoadRequestModel } from './project-comment-lazyLoad-request.model';

export interface ProjectCommentRequestModel extends ProjectCommentLazyLoadRequestModel {
    size: number;
    offset: number;
}
