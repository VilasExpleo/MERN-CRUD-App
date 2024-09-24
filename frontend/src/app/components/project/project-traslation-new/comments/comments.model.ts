import { TextNodeStateModel } from 'src/app/shared/models/comments/text-node-state.model';

export interface CommentsModel {
    comments: CommentModel[];
    textNode: TextNodeStateModel;
}

export interface CommentModel {
    createdOn: Date;
    id: number;
    user: string;
    role: string;
    isPrivate: string;
    type: string;
    comment: string;
    languageCode: string;
    languageId: number;
    canDelete: boolean;
}
