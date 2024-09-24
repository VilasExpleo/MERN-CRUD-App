import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommentModel } from 'src/app/components/project/project-traslation-new/comments/comments.model';
import { CreateCommentComponent } from 'src/app/components/project/project-traslation-new/comments/create-comment/create-comment.component';

@Injectable({
    providedIn: 'root',
})
export class CommentsDialogService {
    foreignLanguageChanged = false;

    private commentState = new BehaviorSubject<CommentModel[]>(null);
    commentState$ = this.commentState.asObservable();

    constructor(private dialogService: DialogService) {}

    setCommentState(comment: CommentModel[]) {
        this.commentState.next(comment);
    }

    getCommentState(): Observable<CommentModel[]> {
        return this.commentState$;
    }

    openCommentDialog(languageCode: string, languageId: number) {
        return this.dialogService.open(CreateCommentComponent, {
            header: 'Add Comments',
            width: '50%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            data: {
                languages: [{ languageCode, languageId }],
                isForeignLanguage: true,
                selectedLanguageId: languageId,
            },
        });
    }
}
