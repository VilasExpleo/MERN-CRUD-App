import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-delete-comments',
    templateUrl: './delete-comments.component.html',
})
export class DeleteCommentsComponent {
    constructor(private dialogRef: DynamicDialogRef, private dialogConfig: DynamicDialogConfig) {}

    delete(value: boolean) {
        this.dialogRef.close(value);
    }

    phraseForUser(): string {
        return this.dialogConfig?.data?.isSelfComment
            ? `You are about to delete a comment. Are you sure you want to proceed?`
            : `You are about to delete a comment of another user. Are you sure you want to proceed?`;
    }
}
