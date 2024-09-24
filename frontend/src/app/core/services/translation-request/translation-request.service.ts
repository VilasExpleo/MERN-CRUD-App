/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ProjectTranslationRequest } from 'src/app/components/dashboard/project-manager-dashboard/components/grid/translation-request-grid.model';
import { ViewDocumentsComponentTransformer } from 'src/app/components/dashboard/translation-request/components/view-documents/view-documents.component.transformer';
import { EditableTextModel } from 'src/app/shared/components/editable-list/editable-list.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { JobDetails } from 'src/app/shared/models/translation-request/jobDetails.model';
import { FinishDialogTransformer } from '../../../../app/components/dashboard/project-manager-dashboard/components/dialogs/complete-translation-request/complete-translation-request.transformer';
import { TranslationRequestViewTransformer } from '../../../../app/components/dashboard/translation-request/translation-request-view/translation-request-view.transformer';
import { TranslatorDashboardTransformer } from '../../../../app/components/dashboard/translator-dashboard/translator-dashboard.transformer';
import { ApiService } from '../api.service';
export interface IlanguageSelectionState {
    projectId: number;
    versioNo: number;
    editorLanguage: string;
    pmEmail: string;
    pmName: string;
    pmId: number;
    selectedLanguages: any[];
    availableLanguages: any[];
}

@Injectable({
    providedIn: 'root',
})
export class TranslationRequestService {
    constructor(
        private api: ApiService,
        private finishDialogTransformer: FinishDialogTransformer,
        private translationRequestTransformer: TranslationRequestViewTransformer,
        private translatorDashboardTransformer: TranslatorDashboardTransformer,
        private viewDocumentsComponentTransformer: ViewDocumentsComponentTransformer
    ) {}

    private subject = new BehaviorSubject<any>({});

    // Create translate request / Order translations form state - start
    private langSelectionState = new BehaviorSubject<IlanguageSelectionState>(null);
    langSelectionState$ = this.langSelectionState.asObservable();

    setLangSelectionState(val) {
        this.langSelectionState.next(val);
    }

    getLangSelectionState(): Observable<any> {
        return this.langSelectionState$;
    }

    private jobDetailsState = new BehaviorSubject<JobDetails>(null);
    jobDetailsState$ = this.jobDetailsState.asObservable();

    setJobDetailsState(val: JobDetails) {
        this.jobDetailsState.next(val);
    }

    getJobDetailsState(): Observable<JobDetails> {
        return this.jobDetailsState$;
    }

    private documentsState = new BehaviorSubject<any>(null);
    documentsState$ = this.documentsState.asObservable();

    setDocumentsState(val) {
        this.documentsState.next(val);
    }

    getDocumentsState(): Observable<any> {
        return this.documentsState$;
    }

    private referenceLanguageState = new BehaviorSubject<any>(null);
    referenceLanguageState$ = this.referenceLanguageState.asObservable();

    setReferenceLanguageState(val) {
        this.referenceLanguageState.next(val);
    }

    getReferenceLanguageState(): Observable<any> {
        return this.referenceLanguageState$;
    }

    private filterState = new BehaviorSubject<any>(null);
    filterState$ = this.filterState.asObservable();

    setFilterState(val) {
        this.filterState.next(val);
    }

    getFilterState(): Observable<any> {
        return this.filterState$;
    }

    private statisticsState = new BehaviorSubject<any>(null);
    statisticsState$ = this.statisticsState.asObservable();

    setStatisticsState(val) {
        this.statisticsState.next(val);
    }

    getStatisticsState(): Observable<any> {
        return this.statisticsState$;
    }

    private checklistState = new BehaviorSubject<EditableTextModel[]>([]);
    editableChecklist$ = this.checklistState.asObservable();

    getChecklistState(): Observable<EditableTextModel[]> {
        return this.editableChecklist$;
    }

    setChecklistState(checklist: EditableTextModel[]) {
        this.checklistState.next(checklist);
    }

    // Set translation request state
    setTranslationRequestState(data) {
        this.subject.next(data);
    }
    // share Translation reuest data between components
    getTranslationRequestState() {
        return this.subject.asObservable();
    }

    // Set Data from Dashboard
    setProjectManager(data) {
        this.subject.next(data);
    }
    // get manager list from DB
    getManager(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    resetTranslationRequestState() {
        this.setLangSelectionState(null);
        this.setJobDetailsState(null);
        this.setDocumentsState(null);
        this.setFilterState(null);
        this.setStatisticsState(null);
        this.setChecklistState([]);
    }

    // Post Translation request data to DB
    createTranslationRequest(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    // Get default manager for translation request
    getProjectManager() {
        return this.subject.asObservable();
    }
    // get statictics data
    getData(data) {
        const url = 'translation-request/translationRequestDetails';
        return this.api
            .postTypeRequest(url, data)
            .pipe(map((response) => this.translationRequestTransformer.transform(response)));
    }

    // get statictics data
    getStaticticsData(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    // get node data after filter
    getNodeData(data, selectedLanguage) {
        const translation_languages: any[] = [];
        const selectedLanguageData = selectedLanguage;

        if (data.length > 0) {
            data.forEach((element) => {
                const getLangId = selectedLanguageData.find((x) => x.name === element.language_code).id;

                if (getLangId != undefined) {
                    const obj: any = {
                        language_code: element.language_code,
                        language_id: getLangId,
                        word_count: element.total_word_count,
                    };

                    translation_languages.push(obj);
                }
            });
        }

        return translation_languages;
    }

    // Save Filter data to DB
    saveFilterDataRequest(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    getAllDocuments(url: string, data) {
        return this.api.postTypeRequest(url, data).pipe(
            catchError(() => of(undefined)),
            map((response: ApiBaseResponseModel) =>
                this.viewDocumentsComponentTransformer.transform(response?.data || [])
            )
        );
    }

    uploadDocuments(url: string, data) {
        return this.api.postTypeRequest(url, data);
    }

    downloadSingleFile(url: string, data) {
        return this.api.getTypeRequest(url, data);
    }

    deleteFile(url: string, data) {
        return this.api.postTypeRequest(url, data);
    }
    // Upload documents on aws
    uploadEditorDocuments(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    // get done count for finish translation request
    getTranslationManagerCount(selectedProject: ProjectTranslationRequest) {
        const requestPayload = {
            project_id: selectedProject.projectId,
            version_id: selectedProject.versionId,
            project_manager_id: selectedProject.projectManagerId,
            translation_request_id: selectedProject.id,
        };

        const url = 'project-manager-dashboard/getTranslationManagerCount';

        return this.api.postTypeRequest(url, requestPayload).pipe(
            // TODO: Need to check the NOK response type
            map((response) => this.finishDialogTransformer.transform(response)),
            catchError((error) => {
                throw new Error(`Response is not ok ${error.message}`);
            })
        );
    }

    // Complete PM order
    completeProjectManagerOrder(url, data) {
        return this.api.patchTypeRequest(url, data);
    }

    completeProjectTranslationRequest(projectTranslationRequest: ProjectTranslationRequest) {
        const url = `project-manager-dashboard/completeOrder`;
        const request = {
            project_id: projectTranslationRequest.projectId,
            version_id: projectTranslationRequest.versionId,
            project_manager_id: projectTranslationRequest.projectManagerId,
            translation_request_id: projectTranslationRequest.id,
        };

        return this.api.patchTypeRequest(url, request);
    }

    // get Translator list from DB
    getTranslator(url, data) {
        return this.api
            .postTypeRequest(url, data)
            .pipe(map((response) => this.translatorDashboardTransformer.transform(response)));
    }

    // Complete Translation order
    completeTranslationOrder(url, data) {
        return this.api.patchTypeRequest(url, data);
    }

    //get table columns
    getTableColumns(editorLanguage) {
        return [
            { field: 'sequence_no', header: 'Seq No', type: 'numeric' },
            { field: 'text_node_id', header: 'Text Node Id', type: 'numeric' },
            {
                field: 'array_item_index',
                header: 'Array Item Index',
                type: 'numeric',
            },
            {
                field: 'variant_id',
                header: 'Variant Id',
                type: 'numeric',
            },
            { field: 'property_name', header: 'Property Name', type: 'text' },
            { field: 'node_type', header: 'Property Type', type: 'text' },
            { field: 'max_width', header: 'Max. Pixel Width', type: 'numeric' },
            { field: 'max_length', header: 'Max. Length', type: 'numeric' },
            { field: 'max_lines', header: 'Max. Lines', type: 'numeric' },
            { field: 'line_break_mode', header: 'Line Break Mode', type: 'text' },
            { field: 'font', header: 'Font', type: 'text' },
            {
                field: 'source',
                header: `Soruce Text(${editorLanguage})`,
                type: 'text',
            },
            {
                field: 'source_status',
                header: `Source State(${editorLanguage})`,
                type: 'text',
                state: 'source_status',
            },
            {
                field: 'user',
                header: `Source User(${editorLanguage})`,
                type: 'text',
            },
            {
                field: 'last_change',
                header: `Source Last Change(${editorLanguage})`,
                type: 'date',
            },
            {
                field: 'comment',
                header: `Source Comment(${editorLanguage})`,
                type: 'text',
            },
            {
                field: 'quality_status',
                header: `Source Quality Status(${editorLanguage})`,
                type: 'text',
            },
            {
                field: 'locked',
                header: `Source Locked(${editorLanguage})`,
                type: 'text',
            },
            {
                field: 'proofread_status',
                header: `Proofread Status`,
                type: 'text',
                state: 'proofread_status',
            },
            {
                field: 'proofread_comment',
                header: `Proofread Comment`,
                type: 'text',
            },
            {
                field: 'review_status',
                header: `Review Status`,
                type: 'text',
                state: 'review_status',
            },
            {
                field: 'review_comment',
                header: `Review Comment`,
                type: 'text',
            },
        ];
    }

    getTableDataForTRFilter(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    getTranslationStatusOfForeginLanguage(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    saveTRFilterTemplete(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    getSavedTemplateList(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    deleteFilterConfig(url, data) {
        return this.api.deleteTypeRequest(url, data);
    }

    getDocumentForReviewer(url: string, data) {
        return this.api.postTypeRequest(url, data);
    }

    // get Translation Request for the same project filter
    isTranslationRequestAvailableSameProject(projects, selectedProjectId) {
        if (projects.length > 0) {
            return projects
                .find((project) => project.project_id === selectedProjectId)
                ?.language_code.map((languageCode) => languageCode.returnedStatus === null);
        }
    }

    saveReassignedProjectManager(url, payload) {
        return this.api.patchTypeRequest(url, payload);
    }

    saveReassignedTranslator(url, payload) {
        return this.api.postTypeRequest(url, payload);
    }

    saveReassignedTranslationManager(url, payload) {
        return this.api.postTypeRequest(url, payload);
    }
}
