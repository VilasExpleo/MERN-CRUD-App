import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { SpellCheckService } from 'src/app/core/services/spellCheck/spell-check.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { EditTextModel } from 'src/app/shared/components/editable-list/edit-text.model';
import { EditableTextModel } from 'src/app/shared/components/editable-list/editable-list.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AddWordRequestModel } from 'src/app/shared/models/spell-check/add-word.request.model';
import { EditWordRequestModel } from 'src/app/shared/models/spell-check/edit-word.request.model';

@Component({
    selector: 'app-spell-check',
    templateUrl: './spell-check.component.html',
})
export class SpellCheckComponent implements OnInit, OnDestroy {
    @Output() hideSettingEvent = new EventEmitter();
    private wordList$ = new BehaviorSubject<EditableTextModel[]>([]);
    words$: Observable<EditableTextModel[]>;
    isLoading = false;
    placeholder = 'Add a Word to the dictionary';
    userId: number;
    enableSearch = true;
    duplicateValidation = true;
    showConfirmation = false;
    confirmationMessage = '';
    confirmationHeader = 'Warning';
    deletedWord: string;
    disableDelete = false;

    constructor(
        private readonly spellCheckService: SpellCheckService,
        private readonly userService: UserService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.userId = this.userService.getUser().id;
        this.words$ = this.wordList$.asObservable();
        this.loadDictionary();
    }

    private loadDictionary(): void {
        this.isLoading = true;
        this.spellCheckService
            .getWords(this.userId)
            .pipe(
                tap((response: EditableTextModel[]) => {
                    this.isLoading = false;
                    this.disableDelete = response.length === 0;
                    this.wordList$.next(response);
                }),
                catchError(() => of([]))
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.wordList$.complete();
    }

    add(word: string) {
        const payload: AddWordRequestModel = { word: word };
        this.spellCheckService
            .add(payload, this.userId)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => this.handleCreateReportResponse(response));
    }

    edit(editTextModel: EditTextModel) {
        const payload: EditWordRequestModel = {
            newWord: editTextModel.newText,
            oldWord: editTextModel.oldText,
        };
        this.spellCheckService
            .edit(payload, this.userId)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => this.handleCreateReportResponse(response));
    }

    deleteAll() {
        this.confirmationMessage = this.getConfirmationMessage('dictionary');
        this.showConfirmation = true;
    }

    delete(word: string) {
        this.confirmationMessage = this.getConfirmationMessage('word');
        this.showConfirmation = true;
        this.deletedWord = word;
    }

    deleteDictionary() {
        this.spellCheckService
            .deleteDictionary(this.userId)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => this.handleCreateReportResponse(response));
    }

    deleteWord(word: string) {
        this.spellCheckService
            .deleteWord(this.userId, word)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => this.handleCreateReportResponse(response));
    }

    private handleCreateReportResponse(response?: ApiBaseResponseModel) {
        if (response?.status === ResponseStatusEnum.OK) {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: response.message,
            });
            this.loadDictionary();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: response.message,
            });
        }
        this.showConfirmation = false;
    }

    onAccept() {
        if (this.deletedWord) {
            this.deleteWord(this.deletedWord);
        } else {
            this.deleteDictionary();
        }
    }

    onReject() {
        this.showConfirmation = false;
    }

    closeSetting() {
        this.hideSettingEvent.emit();
    }

    private getConfirmationMessage(source: string): string {
        return `You are about to delete a ${source}. Are you sure you want to proceed?`;
    }
}
