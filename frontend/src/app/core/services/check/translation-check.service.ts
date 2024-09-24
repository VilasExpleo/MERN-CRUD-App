import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { ErrorLogsTransformer } from 'src/app/components/project/project-traslation-new/tab-view/error-logs/error-logs.transformer';
import { CheckDataModel } from 'src/app/shared/models/check/check-data-model.model';
import { IChecks } from 'src/app/shared/models/check/checks.interface';
import { TranslationCheck, TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import {
    FillRateCondition,
    TranslationCheckConfigModel,
    TranslationCheckModel,
} from 'src/app/shared/models/check/translation-check.model';
import { ConsistencyCheckService } from './consistency-check.service';
import { LabelCheckService } from './label-check.service';
import { PunctuationCheckService } from './punctuation-check.service';
import { UtilityCheckService } from './utility-check.service';

@Injectable({
    providedIn: 'root',
})
export class TranslationCheckService implements IChecks {
    private translationCheck = new BehaviorSubject<TranslationCheckModel[]>(null);
    translationCheck$ = this.translationCheck.asObservable();

    translationChecks: TranslationCheckModel[] = [];

    private progressBarWarning = new BehaviorSubject<boolean>(false);
    progressBarWarning$ = this.progressBarWarning.asObservable();

    private progressBarError = new BehaviorSubject<boolean>(false);
    progressBarError$ = this.progressBarError.asObservable();

    private placeholderLogs = new BehaviorSubject<boolean>(false);
    placeholderLogs$ = this.translationCheck.asObservable();

    constructor(
        private readonly utilityCheckService: UtilityCheckService,
        private readonly errorLogsTransformer: ErrorLogsTransformer,
        private readonly labelCheckService: LabelCheckService,
        private readonly consistencyCheckService: ConsistencyCheckService,
        private readonly punctuationCheckService: PunctuationCheckService
    ) {}
    checkLogs: TranslationCheckModel[] = [];

    setTranslationCheckState(translationCheck: TranslationCheckModel[]) {
        this.translationCheck.next(translationCheck);
    }

    getTranslationCheckState(): Observable<TranslationCheckModel[]> {
        return this.translationCheck$;
    }

    validate(
        translationText: string,
        config: TranslationCheckConfigModel,
        checkData: CheckDataModel,
        isNotEmptyTranslation?: boolean
    ): void {
        this.checkLogs = [];
        if (translationText?.length > 0) {
            this.checkLogs.push(...this.labelCheckService.validate(translationText, config, checkData));
            this.checkLogs.push(...this.consistencyCheckService.validate(translationText, config, checkData));
            this.checkLogs.push(...this.punctuationCheckService.validate(translationText, config, checkData));
        }
        if (isNotEmptyTranslation) {
            this.checkLogs.push(...this.utilityCheckService.validate(translationText, config));
        }
        this.setTranslationCheckState(this.errorLogsTransformer.transform(this.checkLogs));
    }

    setFillRateLog(fillRate: number, config: TranslationCheckConfigModel): void {
        if (config?.fillRate.type !== TranslationCheckType.None) {
            this.setProgressBarValue(fillRate, config);
            this.checkLogs.push(this.utilityCheckService.fillRate(fillRate, config?.fillRate));
            this.setTranslationCheckState(this.errorLogsTransformer.transform(this.checkLogs));
        }
    }

    private setProgressBarValue(fillRate: number, config: TranslationCheckConfigModel): void {
        if (this.isFillRateWarningOrError(fillRate, config, TranslationCheckType.Error) || fillRate > 100) {
            this.progressBarError.next(true);
        } else {
            this.progressBarError.next(false);
        }
        if (this.isFillRateWarningOrError(fillRate, config, TranslationCheckType.Warning) && fillRate <= 100) {
            this.progressBarWarning.next(true);
        } else {
            this.progressBarWarning.next(false);
        }
    }

    getProgressBarValue(): Observable<FillRateCondition> {
        return combineLatest([this.progressBarError$, this.progressBarWarning$]).pipe(
            map(([error, warning]) => {
                return {
                    warning,
                    error,
                };
            })
        );
    }

    setGrammarChecks(grammarCheck: TranslationCheckModel[]): void {
        this.checkLogs.push(...grammarCheck);
        this.setTranslationCheckState(this.errorLogsTransformer.transform(this.checkLogs));
    }

    private isFillRateWarningOrError(fillRate: number, config: TranslationCheckConfigModel, type: string): boolean {
        return fillRate > config?.fillRate.value && config?.fillRate.type === type;
    }

    setPlaceholderLogs(placeholderLogs: TranslationCheckModel[]) {
        this.checkLogs.push(...placeholderLogs);
        this.setTranslationCheckState(this.errorLogsTransformer.transform(this.checkLogs));
    }
    setSpellChecks(spellCheck: TranslationCheckModel[]): void {
        const indexSpellcheck = this.checkLogs?.findIndex((type) => type?.type === TranslationCheck.Spell);
        if (indexSpellcheck === -1) {
            spellCheck[0].message !== '' && this.checkLogs.push(...spellCheck);
        } else {
            spellCheck[0].message !== ''
                ? this.checkLogs?.splice(indexSpellcheck, 1, ...spellCheck)
                : this.checkLogs?.splice(indexSpellcheck, 1);
        }
        this.setTranslationCheckState(this.errorLogsTransformer.transform(this.checkLogs));
    }
}
