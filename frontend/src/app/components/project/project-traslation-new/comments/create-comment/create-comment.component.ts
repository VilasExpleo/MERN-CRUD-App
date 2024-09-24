import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Roles } from 'src/Enumerations';
import { CommentsService } from 'src/app/core/services/project/project-translation/comments.service';
import { noWhitespaceValidator } from 'src/app/shared/custom-validators/no-white-space.validator';
import { CreateCommentRequestModel } from '../../../../../shared/models/comments/comments-create-request.model';

@Component({
    selector: 'app-create-comment',
    templateUrl: './create-comment.component.html',
})
export class CreateCommentComponent implements OnInit {
    templates = [];
    languages = [];
    selectedLanguages = [];
    commentsForm: FormGroup;
    isForeignLanguage = false;
    Roles = Roles;
    currentUserRole: number;
    initFlag = false;

    constructor(
        private formBuilder: FormBuilder,
        private dialogConfig: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private commentService: CommentsService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.currentUserRole = this.commentService.getProjectParameters().role;
        this.initializeCommentForm();
        this.languages = this.dialogConfig.data.languages;
        this.isForeignLanguage = !!this.dialogConfig.data?.isForeignLanguage;
        this.initFlag = true;
        this.selectedLanguages.push(this.dialogConfig.data?.selectedLanguageId);
        this.handleSelectAllLanguagesControl();
        this.handleSingleLanguageSelection();
        this.handleMultiSelectLanguagesControl();
    }

    onSubmit() {
        const payload: CreateCommentRequestModel = {
            comment: this.commentsForm.value.comment,
            isPrivate: this.commentsForm.value.isPrivate,
            languageIds: this.commentsForm.value.languageIds,
            type: this.isForeignLanguage ? 'Editorial' : 'General',
        };

        this.commentService.createComment(payload).subscribe({
            next: (response) => {
                this.dialogRef.close(response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Comments Added Successfully',
                });
            },
            error: (error) => {
                error.error?.message?.forEach((ele: string) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: ele, sticky: true });
                });
            },
        });
    }

    isMultiSelectHidden(): boolean {
        return this.isForeignLanguage ? !this.isForeignLanguage : this.languages.length === 1;
    }

    phraseForUsers(): string {
        if (this.isForeignLanguage && this.isRoleEditor()) {
            return `You made changes to a translation other than your chosen editorial language. This change requires you to leave a
            comment about the reason for this change. Please enter your comment below. Changes on the translation will not be
            saved without leaving a comment`;
        } else if (!this.isForeignLanguage && this.isRoleEditor()) {
            return `Enter your comment below or select a previously saved template. You can select several languages of this textnode
            which your comment will be added to. Modify the selection of the language selection dropdown list below. You can
            also mark your comment as private, so only you can see it.`;
        } else {
            return `Enter your comment below or select a previously saved template.`;
        }
    }

    private isRoleEditor(): boolean {
        return this.currentUserRole === Roles.editor;
    }

    private initializeCommentForm() {
        this.commentsForm = this.formBuilder.group({
            commentTemplate: new FormControl(''),
            languageIds: new FormControl('', Validators.required),
            isPrivate: new FormControl(false),
            selectAll: new FormControl(false),
            comment: new FormControl('', [Validators.required, noWhitespaceValidator()]),
        });
    }

    private handleSelectAllLanguagesControl() {
        this.commentsForm.get('selectAll').valueChanges.subscribe((value) => {
            if (value) {
                this.languages.forEach(
                    (language) =>
                        !this.selectedLanguages.some((languageId) => language.languageId === languageId) &&
                        this.selectedLanguages.push(language.languageId)
                );
                this.selectedLanguages = [...this.selectedLanguages];
                this.initFlag = false;
            } else {
                if (!this.initFlag) this.selectedLanguages = [];
            }
        });
    }

    private handleMultiSelectLanguagesControl() {
        this.commentsForm.get('languageIds').valueChanges.subscribe(() => {
            const selectedLanguageIds = this.commentsForm.get('languageIds').value;
            if (this.languages.length === selectedLanguageIds.length) {
                this.commentsForm.patchValue({ selectAll: true });
            } else {
                this.commentsForm.patchValue({ selectAll: false });
            }
        });
    }

    private handleSingleLanguageSelection() {
        if (this.languages.length === 1) {
            this.commentsForm.patchValue({ selectAll: true });
        }
    }
}
