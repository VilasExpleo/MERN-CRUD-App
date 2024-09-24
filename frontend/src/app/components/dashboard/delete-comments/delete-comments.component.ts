import { Component, OnInit } from '@angular/core';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { catchError, of, tap } from 'rxjs';
import { CommentFlavor, ResponseStatusEnum, UsersRoles } from 'src/Enumerations';
import { UserService } from 'src/app/core/services/user/user.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { DeleteCommentsService } from './../../../core/services/delete-comments/delete-comments.service';
import { TableOperationService } from './../../../core/services/table-operation/table-operation.service';
import { DeleteCommentsRequestModel } from './../../../shared/models/delete-comments/delete-comments-request.model';
import { DeleteCommentsDataModel, DeleteCommentsModel } from './delete-comments.model';

@Component({
    selector: 'app-delete-comments',
    templateUrl: './delete-comments.component.html',
})
export class DeleteCommentsComponent implements OnInit {
    commentsData: DeleteCommentsDataModel;
    selectedComments: DeleteCommentsModel[] = [];
    isLoading: boolean;
    projectId: number;
    selectAll: boolean;
    totalRecords: number;
    filter: any = [];
    commentId;
    commentsCount = 0;
    userRoles = UsersRoles;
    CommentType = {
        General: 'surface-300',
        Review: 'bg-red-300 text-white',
        Proofread: 'bg-red-300 text-white',
        Editorial: 'bg-orange-500 text-white',
        System: 'bg-primary-500 text-white',
    };
    commentHeaderMessage = `Select the comment to be deleted below. Used the filter options to quickly find the comments targeted for
    deletion. Please note that some comments are mandatory and cannot be deleted. These comments are not included in
    below list.`;

    requestPayload;
    lazyEvent: LazyLoadEvent;

    constructor(
        private deleteCommentsService: DeleteCommentsService,
        private user: UserService,
        private config: DynamicDialogConfig,
        private messageService: MessageService,
        private tableOperationService: TableOperationService
    ) {}

    ngOnInit(): void {
        this.projectId = this.config.data.project_id;
        this.isLoading = true;
    }
    getComments(event: LazyLoadEvent) {
        this.lazyEvent = event;
        this.isLoading = true;
        this.requestPayload = this.tableOperationService.processFilter(event, this.projectId);
        this.deleteCommentsService
            .getCommentsData(this.requestPayload)
            .pipe(tap(() => catchError(() => of(undefined))))
            .subscribe({
                next: (response) => {
                    if (response?.comments) {
                        this.commentsData = response;
                        this.totalRecords = response?.totalRecords;
                        this.isLoading = false;
                    }
                },
            });
    }

    onSelectionChange(value = []) {
        this.selectAll = value.length === this.totalRecords;
        this.selectedComments = value;
        this.commentId = this.getCommentId(value);
        this.commentsCount = value.length;
    }

    onSelectAllChange(event: any) {
        if (event.checked) {
            this.selectedComments = [...this.commentsData.comments];
            this.selectAll = true;
            this.commentsCount = this.totalRecords;
            this.commentId = this.getCommentId(this.commentsData.comments);
        } else {
            this.selectedComments = [];
            this.selectAll = false;
            this.commentsCount = 0;
        }

        this.getCommentMessage();
    }

    deleteComment() {
        this.deleteCommentsService
            .deleteCommentsData(this.getDeleteCommentsPayload())
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response: ApiBaseResponseModel) => {
                    if (response.status === ResponseStatusEnum.OK) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Comments deleted successfully',
                        });

                        this.commentsCount = 0;
                        this.selectedComments = [];
                        this.selectAll = false;

                        this.getComments(this.lazyEvent);
                    }
                },
            });
    }

    getCommentMessage() {
        return `Delete ${this.commentsCount} Comments`;
    }

    getCommentFlavor() {
        return Object.values(CommentFlavor);
    }

    getUserRoles() {
        return Object.values(UsersRoles).filter((userRole) => isNaN(Number(userRole)));
    }

    private getDeleteCommentsPayload(): DeleteCommentsRequestModel {
        const user = this.user.getUser();
        return {
            ids: this.commentId,
            isSelectAll: this.selectAll,
            userId: user.id,
            projectId: this.projectId,
            filter: this.requestPayload?.filter,
            sort: this.requestPayload?.sort,
        };
    }

    private getCommentId(comments: DeleteCommentsModel[]): number[] {
        return comments.map((comment) => comment.commentId);
    }
}
