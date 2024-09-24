export interface ProjectCommentResponseModel {
    totalRecords: number;
    comments: CommentDataModel[];
}

export interface CommentDataModel {
    commentId: number;
    date: string;
    comment: string;
    type: string;
    creator: string;
    role: string;
}
