import { CommentDataModel } from '../../../shared/models/delete-comments/project-comment-response.model';
import { DeleteCommentsDataModel, DeleteCommentsModel } from './delete-comments.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DeleteCommentsTransformer {
    transform(response): DeleteCommentsDataModel {
        return {
            comments: this.transformedComments(response.comments),
            totalRecords: response.totalRecords,
        };
    }

    private transformedComments(comments: CommentDataModel[]): DeleteCommentsModel[] {
        return comments?.map((comment: CommentDataModel) => ({
            commentId: comment.commentId,
            date: comment.date,
            comment: comment.comment,
            type: comment.type,
            creator: comment.creator,
            role: comment.role,
        }));
    }
}
