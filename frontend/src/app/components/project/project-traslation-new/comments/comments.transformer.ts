import { Injectable } from '@angular/core';
import { Roles } from 'src/Enumerations';
import { UserService } from 'src/app/core/services/user/user.service';
import { CommentsResponseModel } from 'src/app/shared/models/comments/comments-response.model';
import { TextNodeStateModel } from 'src/app/shared/models/comments/text-node-state.model';
import { CommentsModel } from './comments.model';
import { CommentSource } from './comment-source.enum';

@Injectable({
    providedIn: 'root',
})
export class CommentsTransformer {
    constructor(private userService: UserService) {}

    transform(textNode: TextNodeStateModel, comments: CommentsResponseModel[]): CommentsModel {
        return {
            comments: this.getTransformedComments(comments) ?? [],
            textNode,
        };
    }

    private getTransformedComments(comments: CommentsResponseModel[]) {
        return comments?.map((comment) => ({
            createdOn: new Date(comment.createdOn),
            id: comment.commentId,
            user: comment.user.name ?? 'Unknown',
            role: CommentSource[comment.user.role],
            isPrivate: comment.isPrivate ? 'Private' : 'Public',
            type: comment.flavor,
            comment: comment.comment,
            languageCode: comment.language[0].code,
            languageId: comment.language[0].id,
            canDelete: this.canDelete(comment),
            isSelfComment: this.isSelfComment(comment),
        }));
    }

    private canDelete(comment): boolean {
        const user = this.userService.getUser();
        return (
            !(comment.flavor === 'Editorial' || comment.flavor === 'Proofread' || comment.flavor === 'Review') &&
            (user.id === comment.user.id || user.role === Roles.editor)
        );
    }

    private isSelfComment(comment): boolean {
        const user = this.userService.getUser();
        return user.id === comment.user.id;
    }
}
