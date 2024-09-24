import { TranslationRequestsModel } from './../../../../../shared/models/TranslationRequest/translation-request-response.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { Subscription, catchError, of } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { FileUploadService } from '../../../../../core/services/files/file-upload.service';
import { TranslationRequestService } from '../../../../../core/services/translation-request/translation-request.service';
@Component({
    selector: 'app-manage-documents',
    templateUrl: './manage-documents.component.html',
    styleUrls: ['./manage-documents.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class ManageDocumentsComponent implements OnInit {
    subscription: Subscription;
    selectedFiles = [];
    existingDocs = [];
    docsLoaded = false;
    isUploading = false;
    @ViewChild('fileUpload') fileUpload: FileUpload;

    constructor(
        private router: Router,
        private translationRequestService: TranslationRequestService,
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fileUploadService: FileUploadService
    ) {}

    ngOnInit(): void {
        this.existingDocs = this.config.data.existingDocs;
    }
    prevPage() {
        this.router.navigate([`main/dashboard/job-details`]);
    }

    saveDocuments() {
        this.isUploading = true;
        const payload = {
            project_id: this.config.data.selectedProject.project_id,
            version_id: this.config.data.selectedProject.version_id,
            translation_request_id: this.config.data.translation_request_id,
            created_by: this.config.data.userId,
            updated_by: this.config.data.userId,
            role: this.config.data.role,
        };
        const payloadFormData = new FormData();
        for (const key in payload) {
            payloadFormData.append(key, payload[key]);
        }
        for (const key of this.selectedFiles) {
            payloadFormData.append('data', key);
        }

        this.translationRequestService
            .uploadDocuments('translation-request/aws/multiplefilesupload', payloadFormData)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                this.isUploading = false;
                if (res) {
                    this.messageService.add({ severity: 'success', summary: 'Documents uploaded successfully' });

                    this.getProjectDocs()
                        .pipe(catchError(() => of(undefined)))
                        .subscribe({
                            next: (response: TranslationRequestsModel) => {
                                if (response) {
                                    this.fileUpload.clear();
                                    this.selectedFiles = [];
                                    switch (this.config.data.role) {
                                        case Roles.projectmanager: {
                                            this.existingDocs = response.documents?.projectManager;
                                            break;
                                        }
                                        case Roles.translationmanager: {
                                            this.existingDocs = response.documents?.projectManager;
                                            break;
                                        }
                                        case Roles.editor: {
                                            this.existingDocs = response.documents?.editor;
                                            break;
                                        }
                                        default: {
                                            break;
                                        }
                                    }
                                }
                                this.ref.close({ response });
                            },
                        });
                }
            });
    }

    closeDialog() {
        this.ref.close();
    }

    onSelect(event) {
        this.selectedFiles = event.currentFiles;
    }

    getProjectDocs() {
        return this.translationRequestService.getAllDocuments('translation-request/details', {
            project_id: this.config.data.selectedProject.project_id,
            version_id: this.config.data.selectedProject.version_id,
            translation_request_id: this.config.data.translation_request_id,
            role: this.config.data.role,
        });
    }

    deleteDoc(file_name, index: number) {
        this.translationRequestService
            .deleteFile('translation-request/aws/delete', {
                project_id: this.config.data.selectedProject.project_id,
                version_id: this.config.data.selectedProject.version_id,
                translation_request_id: this.config.data.translation_request_id,
                role: this.config.data.role,
                file: file_name,
            })
            .subscribe({
                next: (res: any) => {
                    if (res.status === 'OK') {
                        this.existingDocs.splice(index, 1);
                        this.messageService.add({ severity: 'success', summary: res.message });
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error deleting the document' });
                    }
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: err.statusText });
                },
            });
    }

    removeFile(event: Event, file: File, uploader: FileUpload) {
        this.messageService.add({ severity: 'warn', summary: `Selected file ${file.name} removed` });
        const index = uploader.files.indexOf(file);
        uploader.remove(event, index);
    }
    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }
}
