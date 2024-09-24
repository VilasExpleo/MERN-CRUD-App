import { CommentSource } from 'src/app/components/project/project-traslation-new/comments/comment-source.enum';

export interface CommentsResponseModel {
    commentId: number;
    dbProjectTextNodeId: number;
    user: AuthorModel;
    comment: string;
    isPrivate: boolean;
    language: LanguageModel[];
    flavor: string;
    createdOn: string;
    updatedOn: string;
}

export interface AuthorModel {
    id: number;
    role: CommentSource;
    name: string;
}

export interface LanguageModel {
    id: number;
    code: string;
}
