import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { Observable, catchError, of, tap } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { DuplicateNameValidator } from 'src/app/core/async-validators/duplicate-name-validator.validator';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { RoleModel } from 'src/app/shared/models/role';
import { AddReportOptionsModel, ReportFormatModel, UploadFileModel, initialAddReportOptions } from './add-report.model';

@Component({
    selector: 'app-add-report',
    templateUrl: './add-report.component.html',
})
export class AddReportComponent implements OnInit {
    isLoading = false;
    reportForm: FormGroup = this.initializeForm();
    model$: Observable<AddReportOptionsModel>;
    private readonly defaultFormat = 'xml';

    @ViewChild('fileUpload', { static: false })
    fileUpload: FileUpload;

    constructor(
        private formBuilder: FormBuilder,
        private projectReportService: ProjectReportService,
        private messageService: MessageService,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.initialize();
        this.reportForm.get('selectedFormat').valueChanges.subscribe(() => {
            this.reportForm.get('name').updateValueAndValidity();
        });
    }

    get name() {
        return this.reportForm.get('name');
    }

    get role() {
        return this.reportForm.get('selectedRole');
    }

    get format() {
        return this.reportForm.get('selectedFormat');
    }

    isMandatoryField(controlName: string): boolean {
        return this.reportForm.controls[controlName]?.errors?.['required'];
    }

    isDuplicateName(controlName: string) {
        return this.reportForm.controls[controlName]?.errors?.['duplicateName'];
    }

    uploadFile(event: any): void {
        const files: File[] = event.files;
        const formData = new FormData();
        formData.append('file', files[0]);
        this.isLoading = true;

        this.projectReportService
            .upload(formData)
            .pipe(tap(() => (this.isLoading = false)))
            .subscribe({
                next: (response: UploadFileModel) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Successfully added report',
                    });
                    this.updateReportFormFileAttributes(response);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed',
                        detail: `Failed to upload ${files[0].name}`,
                    });
                },
            });
    }

    updateReportFormFileAttributes(uploadFileModel?: UploadFileModel) {
        this.reportForm.patchValue({
            xsltName: uploadFileModel?.fileName ?? '',
            xsltData: uploadFileModel?.fileData ?? '',
        });
    }

    onSubmit(): void {
        this.projectReportService
            .addReport(this.getFormValues())
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => this.handleCreateReportResponse(response));
    }

    private handleCreateReportResponse(response?: ApiBaseResponseModel) {
        if (response?.status === ResponseStatusEnum.OK) {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Report Created Successfully',
            });
            this.fileUpload.clear();
            this.eventBus.cast('Report:AfterAddReport');
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: 'Failed to create Report!!',
            });
        }

        this.reportForm.reset();
        this.initialize();
    }

    private getFormValues() {
        const reportForm = this.reportForm.value;
        return {
            description: reportForm.description,
            format: reportForm.selectedFormat?.format,
            name: reportForm.name,
            role: reportForm.selectedRole.map((role: RoleModel) => role.id),
            xsltData: reportForm.xsltData,
            xsltName: reportForm.xsltName,
        };
    }

    private initialize() {
        this.isLoading = true;
        this.model$ = this.projectReportService.getFormOptions().pipe(
            catchError(() => of(initialAddReportOptions)),
            tap((response) => {
                this.isLoading = false;
                this.reportForm.get('selectedFormat').patchValue(this.getDefaultFormat(response.formats));
                this.addReportNameValidator();
            })
        );
    }

    private addReportNameValidator() {
        this.reportForm
            .get('name')
            .addAsyncValidators(
                DuplicateNameValidator.validate(
                    this.projectReportService,
                    'validateDuplicateReportName',
                    'selectedFormat'
                )
            );

        this.reportForm.get('name').updateValueAndValidity();
    }

    private getDefaultFormat(formats: ReportFormatModel[]) {
        return formats.find((format) => format.format.toLocaleLowerCase() === this.defaultFormat);
    }

    private initializeForm() {
        return this.formBuilder.group({
            name: ['', [Validators.required]],
            selectedRole: ['', [Validators.required]],
            selectedFormat: ['', [Validators.required]],
            description: [''],
            xsltName: ['', [Validators.required]],
            xsltData: ['', [Validators.required]],
        });
    }

    downloadXSD() {
        const reportXSDFileName = 'reporting_data/SampleXsd.zip';
        const url = `common/download?fileKey=${reportXSDFileName}`;
        this.projectReportService.downloadReportTemplateXSD(url, reportXSDFileName?.split('/')[1]);
    }
}
