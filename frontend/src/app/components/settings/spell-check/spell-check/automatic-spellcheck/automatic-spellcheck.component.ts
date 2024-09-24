import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { SpellCheckService } from 'src/app/core/services/spellCheck/spell-check.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import {
    DictionaryModel,
    SpellCheckDictionariesRequestModel,
} from 'src/app/shared/models/spell-check/update-spell-check-dictionaries.request.model';
import { SpellCheckDictionaryModel } from './spell-check-dictionary.model';

@Component({
    selector: 'app-automatic-spellcheck',
    templateUrl: './automatic-spellcheck.component.html',
})
export class AutomaticSpellcheckComponent implements OnInit, OnDestroy {
    @Output() closeSettingEvent = new EventEmitter();
    dictionary$ = new BehaviorSubject<SpellCheckDictionaryModel[]>([]);

    isLoading = false;
    searchText: string;

    constructor(
        private readonly spellCheckService: SpellCheckService,
        private readonly userService: UserService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadSpellCheckDictionary();
    }

    private loadSpellCheckDictionary() {
        this.isLoading = true;
        this.spellCheckService
            .getSpellCheckDictionaries(this.userService.getUser().id)
            .pipe(
                tap((response: SpellCheckDictionaryModel[]) => {
                    this.isLoading = false;
                    this.dictionary$.next(response);
                }),
                catchError(() => of([]))
            )
            .subscribe();
    }

    apply(dictionary: SpellCheckDictionaryModel[]) {
        const payload: SpellCheckDictionariesRequestModel = {
            dictionaries: this.checkedLanguages(
                dictionary.filter((item) => item.isDictionaryAvailable).map((item) => item.languageId)
            ),
        };
        this.spellCheckService
            .updateSpellCheckDictionaries(payload, this.userService.getUser().id)
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
            this.closeSettingEvent.emit();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: response.message,
            });
        }
    }

    private checkedLanguages(languageIds: number[]): DictionaryModel[] {
        return languageIds.map((language) => ({
            languageId: language,
        }));
    }

    ngOnDestroy(): void {
        this.dictionary$.complete();
    }

    clear(table: Table) {
        table.clear();
    }
}
