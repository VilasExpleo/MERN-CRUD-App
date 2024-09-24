import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { saveAs } from 'file-saver';
import { DialogService } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { ApiService } from 'src/app/core/services/api.service';
import { ChecklistService } from 'src/app/core/services/translation-request/checklist.service';
import { TranslationManager } from 'src/app/shared/models/tmdata';
import { TranslationRequestService } from '../../../../../core/services/translation-request/translation-request.service';
import { UserService } from '../../../../../core/services/user/user.service';
import { ManageDocumentsComponent } from '../manage-documents/manage-documents.component';
import { ReviewerResponseModel } from './../../../../../shared/models/reviewer/reviewer-api.model';
@Component({
    selector: 'app-view-documents',
    templateUrl: './view-documents.component.html',
})
export class ViewDocumentsComponent implements OnInit, OnChanges {
    @Input() selectedProject;
    @Input() role: string;
    @Input() translation_request_id: number;
    @Input() requestId: number;
    @Input() showDetails;
    @Input() title = 'Description';
    @Output() uploadDocumentsEvent = new EventEmitter<number>();
    userRoles = Roles;
    translationRequestDocuments;
    referenceLanguages;
    userInfo;

    constructor(
        private userService: UserService,
        private translationRequestService: TranslationRequestService,
        private dialogService: DialogService,
        private apiService: ApiService,
        private checklistService: ChecklistService
    ) {}

    ngOnInit(): void {
        this.userInfo = this.userService.getUser();
    }

    ngOnChanges() {
        if (this.selectedProject && this.translation_request_id) {
            this.getProjectDocs(this.selectedProject, this.translation_request_id);
        }
        if (this.role === 'reviewer') {
            this.getProjectDocForReviewer(this.selectedProject, this.requestId);
        }
    }

    getProjectDocs(selectedProject: TranslationManager, translation_request_id: number) {
        let languageId = 0;
        switch (this.role) {
            case 'translator':
                languageId = this.selectedProject.language_id;
                break;
            case 'proofreader':
                languageId = this.selectedProject?.languages[0]?.targetLanguage?.id;
                break;
            case 'editor':
                languageId = 0;
                break;
        }
        selectedProject;
        translation_request_id;
        this.translationRequestService
            .getAllDocuments('translation-request/details', {
                project_id: selectedProject.project_id ? selectedProject.project_id : selectedProject.projectId,
                version_id: selectedProject.version_id ? selectedProject.version_id : selectedProject.versionId,
                translation_request_id: translation_request_id,
                role: this.role,
                languageId,
            })
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res) {
                    this.translationRequestDocuments = res.documents;
                    this.referenceLanguages = res.referenceLanguages;
                    this.checklistService.setChecklist(res.checklist);
                    // TODO : The correct data flow should ensure that data is passed from the parent component to the child component
                    // TODO  as per discuss with jitendra - refactor task
                }
            });
    }

    getProjectDocForReviewer(selectedProject: ReviewerResponseModel, requestId: number) {
        this.translationRequestService
            .getDocumentForReviewer('review/aws/list', {
                projectId: selectedProject.projectId,
                versionId: selectedProject.versionId,
                requestId,
            })
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                this.translationRequestDocuments.editor = res?.data ?? [];
            });
    }

    downloadSingleFile(file: string, role: string | number, documentUrl?: string): void {
        const userRole = this.getUserRole(role);
        const url = this.getDownloadFileUrl(file, userRole, this.translation_request_id, documentUrl);
        this.apiService
            .downloadRequest(url)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (response) saveAs(response, file);
            });
    }

    openManageDocumentsPopup(selectedProject, role: string) {
        let existingDocs = [];
        switch (role) {
            case 'translationmanager':
                existingDocs = this.translationRequestDocuments?.translationManager;
                break;
            case 'projectmanager':
                existingDocs = this.translationRequestDocuments?.projectManager;
                break;
            case 'editor':
                existingDocs = this.translationRequestDocuments?.editor;
                break;
        }

        const ref = this.dialogService.open(ManageDocumentsComponent, {
            header: 'Document Upload',
            closeOnEscape: false,
            autoZIndex: false,
            closable: false,
            width: '60vw',
            data: {
                role,
                userId: this.userInfo.id,
                selectedProject: selectedProject,
                existingDocs,
                translation_request_id: this.translation_request_id,
            },
        });

        ref.onClose.subscribe((data) => {
            if (data) {
                if (data?.response?.documents?.editor)
                    this.translationRequestDocuments.editor = data.response.documents.editor;
                if (data?.response?.documents?.projectManager)
                    this.translationRequestDocuments.projectManager = data.response.documents.projectManager;
                if (data?.response?.documents?.translationManager)
                    this.translationRequestDocuments.translationManager = data.response.documents.translationManager;
            }
            this.uploadDocumentsEvent.emit(
                this.translationRequestDocuments.editor.length +
                    this.translationRequestDocuments.projectManager.length +
                    this.translationRequestDocuments.translationManager.length
            );
        });
    }

    isFilesManagedByUser(role: string): boolean {
        return (
            this.userRoles.editor === this.userRoles[role] ||
            this.userRoles.projectmanager === this.userRoles[role] ||
            this.userRoles.translationmanager === this.userRoles[role]
        );
    }

    getUserRole(role: string | number): string {
        return typeof role === 'string' ? role : this.userRoles[role];
    }

    private getDownloadFileUrl(file: string, role: string, translationRequestId: number, documentUrl: string): string {
        return documentUrl
            ? `common/download?fileKey=${documentUrl}`
            : `common/download?fileKey=translation_request/id_${translationRequestId}/${role}/${file}`;
    }

    isDescriptionVisible(): boolean {
        return !!this.selectedProject?.description || this.isRoleNotReviewer();
    }

    isDocumentNotFound(document = []): boolean {
        return document?.length === 0;
    }

    isDocumentNotFoundForProcessor(document = []): boolean {
        return this.isDocumentNotFound(document) && this.isRoleNotReviewer();
    }

    private isRoleNotReviewer(): boolean {
        return this.userRoles[this.role] !== this.userRoles.reviewer;
    }
}
