/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, Subject, catchError, map, of } from 'rxjs';
import { UploadDialogComponent } from 'src/app/components/length-calculation-and-fonts/upload-dialog/upload-dialog.component';
import { ApiService } from '../api.service';
import { ApiLengthCalculationService } from '../apiLengthCalculation.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { TestBedTransformer } from 'src/app/components/length-calculation-and-fonts/test-bed/test-bed.transformer';
import { TestBedModel } from 'src/app/components/length-calculation-and-fonts/test-bed/test-bed.model';
import { WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { TestBedLcPayloadModel } from 'src/app/shared/models/testbed/test-bed-lc.model';
import { SeverityLevel } from 'src/app/shared/models/check/transaltion-check.enum';
import { WebsocketResponseModel } from 'src/app/shared/models/testbed/test-bed.model';
@Injectable({
    providedIn: 'root',
})
export class LengthCalculationService {
    ref: DynamicDialogRef;
    lcDetails: object;
    lcForm: FormGroup;
    fontsForm: FormGroup;
    isInputDisabled = true;
    tableColumns = [];
    availableLC = [];
    uploadBtnName: string;
    deleteBtnName: string;
    uploadDialogHeader: string;
    tabIndex: number;
    fontsFile: File;
    fontsFileName: string;
    loading = true;
    selectedRow;
    deleteURL: string;
    lcFile: File;
    messages: Message[] = [];
    isLengthcalculationVersionExist = false;
    isLengthcalculationOkButtonDisabled = true;
    isDuplicateFontNameExist = false;
    isDuplicateFontVersionExist = false;
    isFontFileUploaded = false;
    isLoaderVisisble = false;

    private socket$: WebSocketSubject<any>;

    private calculatedMessage = new Subject<WebsocketResponseModel>();
    calculatedMessage$ = this.calculatedMessage.asObservable();

    constructor(
        private readonly dialogService: DialogService,
        private readonly apiService: ApiService,
        private readonly fb: FormBuilder,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly apiLengthCalculationService: ApiLengthCalculationService,
        private readonly testBedTransformer: TestBedTransformer
    ) {
        this.socket$ = new WebSocketSubject(environment.lcWsUrl);
        this.socketSubscription();
    }

    onLoad(tabIndex: number) {
        this.tabIndex = tabIndex;
        this.lcForm = this.fb.group({
            lcName: [''],
            lcAuthor: [''],
            lcVersion: [''],
            lcDescription: [''],
        });
        this.fontsForm = this.fb.group({
            fontName: ['', [Validators.required]],
            fontAuthor: ['', [Validators.required]],
            fontVersion: ['', [Validators.required]],
            fontDescription: ['', [Validators.required]],
        });
        if (tabIndex === 1) {
            this.onFontsTabLoad();
        } else if (tabIndex === 0) {
            this.onLengthCalculationTabLoad();
        }
    }

    onLengthCalculationTabLoad() {
        this.uploadBtnName = 'Upload new LC';
        this.deleteBtnName = 'Delete LC';
        this.uploadDialogHeader = 'Upload Length Calculation';
        this.isDuplicateFontNameExist = false;
        this.isDuplicateFontVersionExist = false;
        this.deleteURL = `deletelc`;
        this.lcForm.controls['lcName'].disable();
        this.lcForm.controls['lcAuthor'].disable();
        this.lcForm.controls['lcVersion'].disable();
        this.lcForm.controls['lcDescription'].disable();
        this.tableColumns = [
            { field: 'lc_name', header: 'Name', filterType: 'text' },
            { field: 'id', header: 'ID', filterType: 'text' },
            { field: 'lc_version', header: 'Version', filterType: 'text' },
            {
                field: 'lc_author',
                header: 'Author',
                filterType: 'text',
            },
            { field: 'lc_desc', header: 'Description', filterType: 'text' },
        ];
        this.getAvailableLC(`project-create/getlcdetails`);
        this.selectedRow = this?.availableLC?.[0];
    }
    onFontsTabLoad() {
        this.uploadBtnName = 'Upload new Fonts';
        this.deleteBtnName = 'Delete Fonts';
        this.uploadDialogHeader = 'Upload Fonts';
        this.isLengthcalculationVersionExist = false;

        this.deleteURL = `deletefont`;

        this.tableColumns = [
            {
                field: 'font_packagename',
                header: 'Font Package',
                filterType: 'text',
            },
            { field: 'font_version', header: 'Version', filterType: 'text' },
            {
                field: 'font_author',
                header: 'Author',
                filterType: 'text',
            },
            { field: 'font_desc', header: 'Description', filterType: 'text' },
        ];
        this.getAvailableLC(`project-create/getfontdetails`);
        this.selectedRow = this?.availableLC?.[0];
    }
    get fromControls() {
        return this.fontsForm.controls;
    }
    getSelectedRow(row) {
        this.selectedRow = row;
    }
    showUploadDialog() {
        this.ref = this.dialogService.open(UploadDialogComponent, {
            header: this.uploadDialogHeader,
            footer: ' ',
            autoZIndex: false,
            closeOnEscape: false,
            width: '50%',
            draggable: true,
            closable: false,
        });
        this.messages = [];
        this.lcDetails = undefined;
        this.isLengthcalculationVersionExist = false;
        this.isLengthcalculationOkButtonDisabled = true;
        this.isDuplicateFontNameExist = false;
        this.isDuplicateFontVersionExist = false;
    }
    closeUploadDialog() {
        this.ref.close();
        this.isLengthcalculationVersionExist = false;
        this.isLengthcalculationOkButtonDisabled = true;
        this.isDuplicateFontNameExist = false;
        this.isDuplicateFontVersionExist = false;
        this.fontsFile = null;
        this.lcFile = null;
        this.lcForm.reset();
        this.fontsForm.reset();
    }

    selectLCFile(event: any, saveLcToDB = 'NOK') {
        this.isLoaderVisisble = true;
        this.lcDetails = undefined;
        const url = `uploadlc`;
        this.lcFile = event;
        const save = saveLcToDB === 'NOK' ? 0 : 1;
        const formData = new FormData();
        formData.append('metadata[]', this.lcFile?.['files']?.[0]);
        formData.append('save', String(save));
        this.messages = [];
        this.apiLengthCalculationService
            .postTypeRequest(url, formData)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.lcDetails = res?.['data'];
                        this.lcForm.patchValue({
                            lcName: this.lcDetails?.['name'],
                            lcAuthor: this.lcDetails?.['author'],
                            lcVersion: this.lcDetails?.['version'],
                            lcDescription: this.lcDetails?.['description'],
                        });

                        const duplicateLengthcalculationVersion = this.availableLC.find(
                            (item) =>
                                item?.lc_version == this.lcDetails?.['version'] &&
                                item?.lc_name == this.lcDetails?.['name']
                        );

                        if (duplicateLengthcalculationVersion || res?.['errorStatus']) {
                            this.isLengthcalculationVersionExist = !!duplicateLengthcalculationVersion;
                            this.isLengthcalculationOkButtonDisabled = true;
                        } else {
                            this.isLengthcalculationVersionExist = false;
                            this.isLengthcalculationOkButtonDisabled = false;
                        }
                        this.messages = this.getMessage(res?.['errorStatus'], res?.['message']);
                        if (save === 1) {
                            this.getAvailableLC(`project-create/getlcdetails`);
                            this.closeUploadDialog();
                            this.lcForm.reset();
                        }
                    }
                    this.isLoaderVisisble = false;
                },
            });
    }

    // delete Font and length calculation based on id
    deteletSelectedRecord() {
        this.confirmationService.confirm({
            message:
                this.tabIndex === 0
                    ? 'Are you sure you want to delete this LC?'
                    : 'Are you sure you want to delete this Font?',
            acceptButtonStyleClass: 'p-button-danger ml-1 p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-sm',
            accept: () => {
                this.apiLengthCalculationService
                    .postTypeRequest(this.deleteURL, { id: this.selectedRow?.id })
                    .pipe(catchError((error) => of(error)))
                    .subscribe({
                        next: (res) => {
                            if (res?.['status'] === 'OK' && !res?.['errorStatus']) {
                                if (this.tabIndex === 1) {
                                    this.getAvailableLC(`project-create/getfontdetails`);
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Fonts',
                                        detail: `Font '${this.selectedRow?.font_packagename}' successfully deleted.`,
                                    });
                                } else if (this.tabIndex === 0) {
                                    this.getAvailableLC(`project-create/getlcdetails`);
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Length Calculation',
                                        detail: `Length calculation '${this.selectedRow?.lc_name}' successfully deleted.`,
                                    });
                                }
                                this.confirmationService.close();
                            } else if (res?.['status'] === 'OK' && res?.['errorStatus']) {
                                this.showDeleteWarningPopup(res['message']);
                            }
                        },
                    });
            },
            reject: () => {
                this.confirmationService.close();
            },
        });
    }

    selectFontsFile(event) {
        this.fontsFile = event?.files?.[0];
        this.fontsFileName = event?.files?.[0]?.name;
        if (this.fontsFile) {
            this.isFontFileUploaded = true;
        }
    }
    onFileRemove() {
        this.isFontFileUploaded = false;
    }

    submitFontsForm(fdata) {
        this.isLoaderVisisble = true;
        const url = `uploadfont`;
        const formData = {
            name: fdata.fontName,
            author: fdata.fontAuthor,
            version: fdata.fontVersion,
            description: fdata.fontDescription,
        };
        const form_data = new FormData();
        form_data.append('metadata[]', this.fontsFile, this.fontsFileName);
        for (const key in formData) {
            form_data.append(key, formData[key]);
        }
        this.apiLengthCalculationService
            .postTypeRequest(url, form_data)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.getAvailableLC(`project-create/getfontdetails`);
                        this.closeUploadDialog();
                        this.fontsForm.reset();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Fonts',
                            detail: `Fonts uploaded successfully!`,
                        });
                        this.isLoaderVisisble = false;
                    }
                },
            });
    }
    updateLCTable() {
        if (this.lcDetails && this.lcFile) {
            this.selectLCFile(this.lcFile, 'OK');
            this.closeUploadDialog();
            this.messageService.add({
                severity: 'success',
                summary: 'Length Calculations',
                detail: `Length Calculations uploaded successfully!`,
            });
        } else {
            this.closeUploadDialog();
        }
    }

    getAvailableLC(url) {
        this.apiService
            .getTypeRequest(url, {})
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.availableLC = res?.['data'];

                        this.selectedRow = res?.['data'][0];
                        this.loading = false;
                    } else {
                        this.availableLC = [];
                        this.loading = false;
                    }
                },
            });
    }

    checkUniqueFontName(event) {
        const duplicateFontName = this.availableLC.find((font) => {
            return font?.font_packagename === event.target.value;
        });

        if (duplicateFontName) {
            this.isDuplicateFontNameExist = true;
        } else {
            this.isDuplicateFontNameExist = false;
        }
    }
    checkUniqueFontVersion(event) {
        const duplicateFontVersion = this.availableLC.find((font) => {
            return font?.font_version == event.target.value;
        });

        if (duplicateFontVersion) {
            this.isDuplicateFontVersionExist = true;
        } else {
            this.isDuplicateFontVersionExist = false;
        }
    }
    showDeleteWarningPopup(message: string) {
        this.confirmationService.confirm({
            message,
            acceptLabel: `OK`,
            rejectVisible: false,
            header: `Warning`,
            acceptIcon: `pi pi-thumbs-up`,

            accept: () => {
                this.confirmationService.close();
            },
        });
    }

    getTestBedConfiguration(): Observable<TestBedModel> {
        return this.apiService.getRequest<ApiBaseResponseModel>('calculate-length/testbed-config').pipe(
            catchError(() => of({ data: {} })),
            map((response) => this.testBedTransformer.transform(response?.data))
        );
    }

    sendLengthCalculationPayload(payload: TestBedLcPayloadModel): void {
        this.socket$.next({
            type: 'calculateWidthForTestbed-client',
            content: payload,
        });
    }

    setCalculatedMessage(message: WebsocketResponseModel): void {
        this.calculatedMessage.next(message);
    }

    getCalculatedMessage(): Observable<WebsocketResponseModel> {
        return this.calculatedMessage$;
    }

    private socketSubscription(): void {
        this.socket$.asObservable().subscribe((response: WebsocketResponseModel) => {
            this.setCalculatedMessage(response);
        });
    }

    private getMessage(isError: boolean, message: string): Message[] {
        const severity = isError ? SeverityLevel.Error : SeverityLevel.Success;
        const summary = isError ? 'Error' : 'Success';
        return [{ severity, summary, detail: message }];
    }
}
