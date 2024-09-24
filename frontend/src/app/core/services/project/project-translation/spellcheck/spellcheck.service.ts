import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, Subject, catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { TranslationCheck, TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import { TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';
import {
    SpellCheckRequestInitModel,
    SpellCheckRequestModel,
    SpellCheckResponseInitModel,
    suggestionsRequestModel,
} from 'src/app/shared/models/spell-check/spellcheck.model';
import { SocketService } from 'src/app/shared/websocket/socket.service';
import { ApiService } from '../../../api.service';
import { TranslationCheckService } from '../../../check/translation-check.service';
import { UserService } from '../../../user/user.service';
import { ProjectTranslationService } from '../project-translation.service';

@Injectable({
    providedIn: 'root',
})
export class SpellcheckService {
    private suggestionText: string;
    private spellCheckInitResponse;
    private spellCheckResponse;
    private spellcheckSuggestionsSubject = new Subject<string[]>();
    private spellcheckSubject = new Subject<string[]>();
    private insertTextSubject = new Subject<string>();

    constructor(
        private readonly apiService: ApiService,
        private readonly socketService: SocketService,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly translationCheckService: TranslationCheckService,
        private readonly projectTranslationService: ProjectTranslationService
    ) {}
    initSocketListeners(): void {
        this.socketService.socket.on('spell-check-init', (response) => this.handleSpellCheckInit(response));
        this.socketService.socket.on('spell-check', (response) => this.handleSpellcheck(response));
        this.socketService.socket.on('suggestions', (response) => this.handleSuggestions(response));
    }

    private handleSpellCheckInit(response: SpellCheckResponseInitModel): void {
        this.spellCheckInitResponse = response;
        if (!response?.status && response?.message !== '') {
            this.handleSpellCheckResponse(response?.message);
        }
    }

    private handleSpellcheck(response: string[]): void {
        this.spellCheckResponse = response;
        if (response !== null) {
            this.spellcheckSubject.next(response);
            if (response?.length !== 0) {
                this.handleSpellCheckResponse('Misspelled Word. ' + "'" + response.join("', '") + "'");
            } else {
                this.handleSpellCheckResponse('');
            }
        }
    }

    handleSuggestions(response: string[]): void {
        if (response !== null) {
            this.spellcheckSuggestionsSubject.next(response);
        }
    }

    socketConnect(): void {
        this.socketService.socket.connect();
    }

    initializeSpellcheck(payload: SpellCheckRequestInitModel): void {
        this.socketService.socket.emit('spell-check-init', payload);
    }

    spellcheck(payload: SpellCheckRequestModel): void {
        this.spellCheckInitResponse?.status && this.socketService.socket.emit('spell-check', payload);
    }

    suggestions(payload: suggestionsRequestModel): void {
        this.suggestionText = payload.word;
        this.spellCheckInitResponse?.status && this.socketService.socket.emit('suggestions', payload);
    }

    spellcheckSuggestions(): Observable<string[]> {
        return this.spellcheckSuggestionsSubject.asObservable();
    }

    getSpellcheck(): Observable<string[]> {
        return this.spellcheckSubject.asObservable();
    }

    insertText(text: string): void {
        const translationText = this.projectTranslationService?.translationText;
        const translationInsertText = this.replaceWordInString(translationText, this.suggestionText, text);
        this.insertTextSubject.next(translationInsertText);
    }

    getInsertText(): Observable<string> {
        return this.insertTextSubject.asObservable();
    }

    private replaceWordInString(inputString: string, targetWord: string, replacement: string): string {
        const regex = new RegExp(`\\b${targetWord}\\b`, 'g');
        return inputString.replace(regex, replacement);
    }

    addWordToDictionary(): void {
        const userId = this.userService.getUser()?.id;
        const url = `spell-check/custom-dictionary/add/${userId}`;
        const requestPayload = { word: this.suggestionText };

        this.apiService
            .postTypeRequest(url, requestPayload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                const messageSeverity = response.status === ResponseStatusEnum.OK ? 'success' : 'error';
                this.messageService.add({
                    severity: messageSeverity,
                    summary: messageSeverity,
                    detail: response?.message,
                });
                const words = this.spellCheckResponse?.filter((word) => word !== this.suggestionText);
                this.spellcheckSubject.next(words);
            });
    }

    handleSpellCheckResponse(response) {
        let warningCheck: TranslationCheckModel[] = [];
        warningCheck = this.handleLogs([response], TranslationCheckType.Warning, TranslationCheck.Spell);
        this.translationCheckService.setSpellChecks([...warningCheck]);
    }

    private handleLogs(
        issueLogs: string[],
        translationCheckType: TranslationCheckType,
        translationCheck: TranslationCheck
    ): TranslationCheckModel[] {
        return (
            issueLogs.map((message) => {
                return this.createLogs(translationCheckType, translationCheck, message);
            }) ?? []
        );
    }

    private createLogs(logLevel: TranslationCheckType, type: TranslationCheck, message: string): TranslationCheckModel {
        return {
            logLevel,
            type,
            message,
        };
    }

    translationTextSpellcheck() {
        const spellcheckPayload = {
            languageCode: this.projectTranslationService.selectedLanguageCode,
            userId: this.userService.getUser().id,
            word: this.translationTextInWords(),
        };
        console.warn(spellcheckPayload);
        this.spellcheck(spellcheckPayload);
    }

    private translationTextInWords(): string[] {
        return (
            this.projectTranslationService?.translationText?.split(/[\n\s]+/)?.filter((word) => word.length >= 3) || []
        );
    }
}
