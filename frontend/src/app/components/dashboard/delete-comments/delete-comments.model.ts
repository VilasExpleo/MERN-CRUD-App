export interface DeleteCommentsDataModel {
    totalRecords: number;
    comments: DeleteCommentsModel[];
}

export interface DeleteCommentsModel {
    commentId: number;
    date: string;
    comment: string;
    type: string;
    creator: string;
    role: string;
}
