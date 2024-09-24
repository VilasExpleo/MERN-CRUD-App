import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter, map, switchMap, take, takeUntil } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { CommentsTransformer } from 'src/app/components/project/project-traslation-new/comments/comments.transformer';
import { CreateCommentRequestModel } from 'src/app/shared/models/comments/comments-create-request.model';
import { CommentsRequestModel } from 'src/app/shared/models/comments/comments-request.model';
import { CommentsResponseModel, LanguageModel } from 'src/app/shared/models/comments/comments-response.model';
import { TextNodeStateModel } from 'src/app/shared/models/comments/text-node-state.model';
import { ApiService } from '../../api.service';
import { UserService } from '../../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class CommentsService {
    languages = [];
    Roles = Roles;

    private textNodeState = new BehaviorSubject<TextNodeStateModel>(null);
    textNodeState$ = this.textNodeState.asObservable();

    private endSubject$ = new Subject<boolean>();

    constructor(
        private apiService: ApiService,
        private user: UserService,
        private commentsTransformer: CommentsTransformer
    ) {}

    setTextNodeState(textNodeState: TextNodeStateModel) {
        this.textNodeState.next(textNodeState);
    }

    getTextNodeState(): Observable<TextNodeStateModel> {
        return this.textNodeState$;
    }

    setLanguagesFromTextNode(textNodes, userLanguage: LanguageModel) {
        this.languages = [];
        const [{ data, children }] = textNodes;

        // Get language array for selected text node for selected language
        if (!children || children.length === 0) {
            this.languages.push({
                languageCode: data?.languagecode ?? userLanguage?.code,
                languageId: data?.language_id,
            });
        } else {
            // Set language for user language
            this.languages.push({
                languageCode: userLanguage?.code,
                languageId: userLanguage?.id,
            });

            //  Set all languages under the selected text node
            children?.map((childNode) => {
                !this.languages.some((language) => language.languageId === childNode?.data.language_id) &&
                    this.languages.push({
                        languageCode: childNode?.data.context,
                        languageId: childNode?.data.language_id,
                    });
            });
        }
    }

    setTextNodeForComments(textNodeId: number, languageId: number) {
        this.setTextNodeState({ textNodeId: textNodeId, languageId: languageId });
    }

    getLanguages() {
        return this.languages;
    }

    createComment(comment: CreateCommentRequestModel) {
        return this.getTextNodeState().pipe(
            take(1),
            switchMap((textNode: TextNodeStateModel) => {
                return this.apiService
                    .postTypeRequestTyped('comments/create', this.getAddCommentPayload(comment, textNode))
                    .pipe(map((response) => this.commentsTransformer.transform(textNode, response['data'])));
            })
        );
    }

    getComments() {
        return this.getTextNodeState().pipe(
            takeUntil(this.endSubject$),
            filter((state) => !!state),
            switchMap((textNode: TextNodeStateModel) => {
                const payload: CommentsRequestModel = this.getCommentsPayload(textNode.textNodeId, textNode.languageId);

                return this.apiService
                    .postTypeRequest('comments/get', payload)
                    .pipe(map((response) => this.commentsTransformer.transform(textNode, response['data'])));
            })
        );
    }

    deleteComments(id: number) {
        return this.apiService
            .postTypeRequest('comments/delete', { userId: this.user.getUser().id, id })
            .pipe(map((response) => response['status']));
    }

    resetState() {
        this.endSubject$.next(true);
        this.textNodeState.next(null);
    }

    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            return JSON.parse(localStorage.getItem('projectProps'));
        }
    }

    private getAddCommentPayload(comment: CreateCommentRequestModel, textNode: TextNodeStateModel) {
        const user = this.user.getUser();
        let payload = {
            languageIds: comment.languageIds,
            isPrivate: comment.isPrivate,
            comment: comment.comment,
            flavor: comment.type,
            projectId: this.getProjectParameters().projectId,
            userId: user.id,
            dbProjectTextNodeId: textNode.textNodeId,
        };
        payload = this.getAdditionalPayloadForUsers(payload, user.role);
        return payload;
    }

    private getCommentsPayload(textNodeId: number, languageId: number) {
        const user = this.user.getUser();
        let payload = {
            dbProjectTextNodeId: textNodeId,
            languageId,
            userId: user.id,
        };

        payload = this.getAdditionalPayloadForUsers(payload, user.role);
        return payload;
    }

    private getAdditionalPayloadForUsers(payload, role: number) {
        const requestId = this.getProjectParameters().translationRequestId;
        switch (role) {
            case Roles.reviewer:
                payload['reviewRequestId'] = requestId;
                return payload;
            case Roles.translator:
            case Roles.proofreader:
                payload['translationRequestId'] = requestId;
                return payload;
            default:
                return payload;
        }
    }

    getTransformedComments(comments: CommentsResponseModel[]) {
        return comments?.map((comment) => ({
            createdOn: new Date(comment.createdOn),
            id: comment.commentId,
            user: comment.user.name,
            role: Roles[comment.user.role],
            isPrivate: comment.isPrivate ? 'Private' : 'Public',
            type: comment.flavor,
            comment: comment.comment,
            languageCode: comment.language[0].code,
            languageId: comment.language[0].id,
            canDelete: this.canDelete(comment),
        }));
    }

    private canDelete(comment): boolean {
        const user = this.user.getUser();
        return comment.flavor === 'General' && (user.id === comment.user.id || user.role === Roles.editor);
    }
}
