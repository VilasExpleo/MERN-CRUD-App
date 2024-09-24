export interface CreateCommentRequestModel {
    comment: string;
    isPrivate: boolean;
    languageIds: number[];
    type: string;
}
