import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { Subscription, catchError, combineLatest, of } from 'rxjs';
import { TranslationRoleEnum } from 'src/Enumerations';
import { LogService } from 'src/app/core/services/logService/log.service';
import { ChecklistService } from 'src/app/core/services/translation-request/checklist.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { EditableTextModel } from 'src/app/shared/components/editable-list/editable-list.model';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { TranslationLanguagesModel } from '../reference-language/reference-language.model';
@Component({
    selector: 'app-translation-confirmation',
    templateUrl: './translation-confirmation.component.html',
    styleUrls: ['./translation-confirmation.component.scss'],
})
export class TranslationConfirmationComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    userInfo;
    private payloadSubscription: Subscription;
    private payloadObj;

    @Output()
    navigationEvent = new EventEmitter<number>();
    @Output()
    closeDialog = new EventEmitter<boolean>();

    constructor(
        private router: Router,
        public translationRequestService: TranslationRequestService,
        private userService: UserService,
        private messageService: MessageService,
        private logService: LogService,
        private eventBus: NgEventBus,
        private checklistService: ChecklistService
    ) {}

    ngOnInit(): void {
        const langSelectionState = this.translationRequestService.getLangSelectionState();
        const jobDetailsState = this.translationRequestService.getJobDetailsState();
        const documentsState = this.translationRequestService.getDocumentsState();
        const filterState = this.translationRequestService.getFilterState();
        const staticticsState = this.translationRequestService.getStatisticsState();
        const checklistState = this.translationRequestService.getChecklistState();
        const referenceLanguageState = this.translationRequestService.getReferenceLanguageState();
        const payload$ = combineLatest([
            langSelectionState,
            jobDetailsState,
            documentsState,
            filterState,
            staticticsState,
            checklistState,
            referenceLanguageState,
        ]);

        this.payloadSubscription = payload$.subscribe(
            ([
                langSelectionRes,
                jobDetailsRes,
                documentsRes,
                filterRes,
                staticticsRes,
                checklistRes,
                referenceLanguageRes,
            ]) => {
                this.payloadObj = {
                    ...langSelectionRes,
                    ...jobDetailsRes,
                    ...documentsRes,
                    ...filterRes,
                    ...staticticsRes,
                    ...{ checklist: checklistRes },
                    ...referenceLanguageRes,
                };
            }
        );

        this.userInfo = this.userService.getUser();
    }
    navigate(index: number) {
        this.navigationEvent.emit(index);
    }

    // Convert date in to 'YYYY-MM-DD'
    convert(date: Date) {
        const due_date = new Date(date),
            mnth = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return [due_date.getFullYear(), mnth, day].join('-');
    }
    createTranslationRequest() {
        const url = `translation-request/create-request`;
        const uploadUrl = `translation-request/aws/multiplefilesupload`;
        const languages = [];
        this.payloadObj.selectedLanguages?.forEach((item) => {
            languages.push({
                language_code: item.name,
                language_id: item.id,
            });
        });

        const payload = {
            project_id: this.payloadObj.projectId,
            version_id: this.payloadObj.versioNo,
            selected_language: languages,
            editor_id: this.userInfo['id'],
            editor_email: this.userInfo['email'],
            project_manager_id: this.payloadObj.selectedManager.id,
            project_manager_email: this.payloadObj.selectedManager.email,
            proofread: this.payloadObj.proofRead,
            description: this.payloadObj.description,
            source_id: this.payloadObj.sourseLanguage.id,
            source_language: this.payloadObj.sourseLanguage.name,
            due_date: this.convert(this.payloadObj.statistics.deuDate),
            constrainedMode: this.payloadObj.isConstrained
                ? TranslationRoleEnum.Constrained
                : TranslationRoleEnum.Unconstrained,
            checklist: this.getCheck(this.payloadObj.checklist),
        };

        const awsPayload = {
            project_id: this.payloadObj.projectId,
            version_id: this.payloadObj.versioNo,
            translation_request_id: '',
            created_by: this.userInfo['id'],
            updated_by: this.userInfo['id'],
            role: 'editor',
        };

        this.translationRequestService
            .createTranslationRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res !== undefined) {
                    const response = JSON.parse(JSON.stringify(res));
                    this.saveFilterData(response.data[0].translate_request_id);
                }
                if (res['status'] === 'OK') {
                    awsPayload.translation_request_id = res['data'][0]['translate_request_id'];
                    const form_data = new FormData();
                    for (const key in awsPayload) {
                        form_data.append(key, awsPayload[key]);
                    }
                    for (const file of this.payloadObj.selectedFiles) {
                        form_data.append('data', file);
                    }

                    this.closeDialog.emit(true);
                    this.translationRequestService
                        .uploadEditorDocuments(uploadUrl, form_data)
                        .pipe(catchError(() => of(undefined)))
                        .subscribe(() => {
                            this.eventBus.cast('translationrequest:translationrequest', '');
                        });
                }
            });
    }
    // Save filterd data
    saveFilterData(id) {
        let nodeList = [];
        this.translationRequestService
            .getFilterState()
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res) {
                    nodeList = res.nodeList;
                }
            });
        const url = `translation-request/save-filter-data`;
        const filterPayload = {
            project_id: this.payloadObj?.projectId,
            version_id: this.payloadObj?.versioNo,
            translation_request_id: id,
            project_title: this.payloadObj?.projectTitle,
            brand_id: this.userInfo?.brand_id,
            brand_name: this.userInfo?.brand_name.trim(),
            editor_language_id: this.payloadObj?.editorLanguageId,
            editor_language_code: this.payloadObj?.editorLanguage,
            source_language_id: this.payloadObj?.sourseLanguage.id,
            source_language_code: this.payloadObj?.sourseLanguage.name,
            editor_id: this.userInfo?.id,
            filter_data: this.payloadObj?.filterObject,
            translation_languages: this.updateIsDoneValue(this.payloadObj?.translation_languages),
            text_nodes: nodeList,
            export: this.payloadObj?.unfinishedNodes,
            constrainedMode: this.payloadObj.isConstrained
                ? TranslationRoleEnum.Constrained
                : TranslationRoleEnum.Unconstrained,
        };

        this.translationRequestService
            .saveFilterDataRequest(url, filterPayload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.router.navigate([`main/dashboard`]);
                }
            });
    }

    ngOnDestroy() {
        this.payloadSubscription.unsubscribe();
    }

    getCheck(checklist: EditableTextModel[]): ChecklistModel[] {
        return checklist.map((check) => ({
            check: check.text,
            isChecked: false,
        }));
    }

    private updateIsDoneValue(translationLanguages): TranslationLanguagesModel[] {
        return translationLanguages.map((language) => {
            const updatedAdditionalLanguage = language.additional_languages.map((additionalLanguage) => ({
                ...additionalLanguage,
                is_done: language.isDone,
            }));
            return {
                ...language,
                additional_languages: updatedAdditionalLanguage,
            };
        });
    }
}
