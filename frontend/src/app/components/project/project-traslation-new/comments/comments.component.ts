import { Component, OnInit } from '@angular/core';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Subject, catchError, of, takeUntil, tap } from 'rxjs';
import { CommentFlavor } from 'src/Enumerations';
import { GridService } from 'src/app/core/services/grid/grid.service';
import { CommentsDialogService } from 'src/app/core/services/project/project-translation/comments-dialog.service';
import { CommentsService } from 'src/app/core/services/project/project-translation/comments.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { TabService } from 'src/app/core/services/project/project-translation/tab.service';
import { CommentsModel } from './comments.model';
import { CreateCommentComponent } from './create-comment/create-comment.component';
import { DeleteCommentsComponent } from './delete-comments/delete-comments.component';
import { CommentSource } from './comment-source.enum';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
})
export class CommentsComponent implements OnInit {
    model: CommentsModel;
    userRoles = [];
    commentType = [];
    searchKey: string;
    isLoading = false;
    destroyed$ = new Subject<boolean>();
    CommentType = {
        General: 'surface-300',
        Review: 'bg-red-300 text-white',
        Proofread: 'bg-red-300 text-white',
        Editorial: 'bg-orange-500 text-white',
        System: 'bg-primary-500 text-white',
    };

    constructor(
        private dialogService: DialogService,
        private commentService: CommentsService,
        private projectTranslationService: ProjectTranslationService,
        private gridService: GridService,
        private commentsDialogService: CommentsDialogService,
        private eventBus: NgEventBus,
        private tabService: TabService
    ) {}

    ngOnInit(): void {
        this.getComments();
        this.getCommentState();
        this.userRoles = this.gridService.getFilterFromNumericEnum(CommentSource);
        this.commentType = this.gridService.getFilterFromStringEnum(CommentFlavor);
        this.eventBus.on('RejectedStatus:Comment').subscribe({
            next: (resp: MetaData) => {
                if (resp.data) this.model.comments.unshift(...resp.data);
            },
        });
    }

    showAddCommentDialog() {
        const dialogRef = this.dialogService.open(CreateCommentComponent, {
            header: 'Add Comments',
            width: '50%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            data: {
                languages: this.commentService.getLanguages(),
                selectedLanguageId: this.projectTranslationService.languageId,
            },
        });

        dialogRef.onClose.subscribe((res: CommentsModel) => {
            const filteredData =
                res?.comments.filter((comment) => comment.languageId === res.textNode.languageId) ?? [];
            this.model.comments.unshift(...filteredData);
        });
    }

    clear(table: Table) {
        table.clear();
        this.searchKey = '';
    }

    deleteComment(id: number, isSelfComment: boolean) {
        const dialogRef = this.dialogService.open(DeleteCommentsComponent, {
            header: 'Delete Comment',
            width: '35%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            data: {
                isSelfComment,
            },
        });
        dialogRef.onClose.subscribe((response: boolean) => {
            if (response) {
                this.delete(id);
            }
        });
    }

    private delete(id: number) {
        this.isLoading = true;
        this.commentService
            .deleteComments(id)
            .pipe(tap(() => catchError(() => of(undefined))))
            .subscribe({
                next: (res) => {
                    this.isLoading = false;
                    if (res === 'OK') {
                        this.model.comments = this.model.comments.filter((comment) => comment.id !== id);
                    }
                },
            });
    }

    private getComments() {
        this.commentService
            .getComments()
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.model = res;
                        this.tabService.setCountCommentState(this.model?.comments?.length);
                    }
                },
            });
    }

    private getCommentState() {
        this.commentsDialogService
            .getCommentState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((comment) => {
                if (comment?.length > 0) this.model.comments.unshift(...comment);
            });
    }
}
