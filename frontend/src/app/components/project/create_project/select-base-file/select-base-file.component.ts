import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationService, Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { Subscription, catchError, of } from 'rxjs';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { UploadxmlService } from 'src/app/core/services/xml/uploadxml/uploadxml.service';
import * as converter from 'xml-js';
const parser = new DOMParser();
@Component({
    selector: 'app-select-base-file',
    templateUrl: './select-base-file.component.html',
    styleUrls: ['./select-base-file.component.scss'],
})
export class SelectBaseFileComponent implements OnInit, OnDestroy {
    languageList = [];
    languageInheritanceList = [];
    projectDetails = [];
    showHide = false;
    fileName!: string;
    error;
    finalData = [];
    baseFileForm!: UntypedFormGroup;
    formData;
    uploadedXmlFile!: File;
    groupNodeCount;
    textNodeCount;
    variants = [];
    isNextDesabled: boolean;
    isFileSelected = false;
    errorMsg;
    msgs1: Message[];
    isValid: boolean | undefined;
    uuid;
    errorMesg;
    postObj;
    projectName;
    statusMessage = '';
    errorMessage = '';
    xmlError;
    wrongXml = '';
    parserRes;
    parserError;
    validationResult = false;
    validationError = false;
    parserResult = false;
    wrongXmlFile = false;
    hide = true;
    errorListContainer = true;
    ErrorInXml = false;
    uploadXml;
    validateXml;
    disableButton;
    errorContainer = false;
    disableNext = false;
    loadingFileSpinner = false;
    msgs: Message[] = [];
    hideCancelPopup = false;
    projectDescription: string;
    baseFileSubscription: Subscription;
    routerSubs: Subscription;
    langPropsSubscription: Subscription;
    projectProperties;
    defaultPlaceholders = [];
    supplierPlaceholders = [];

    @ViewChild('cancelButton') cancelButton: ElementRef;
    fileSize;

    constructor(
        private messageService: MessageService,
        private projectService: ProjectService,
        private router: Router,
        private fb: UntypedFormBuilder,
        private primengConfig: PrimeNGConfig,
        private uploadXmlService: UploadxmlService,
        private confirmationService: ConfirmationService,
        private fileUploadService: FileUploadService
    ) {
        // Close the create project form on browser back button event
        this.routerSubs = this.router.events.subscribe((value) => {
            if (value instanceof NavigationEnd && value.urlAfterRedirects === '/main/dashboard') {
                this.projectService.closeCreateDialog();
                this.router.navigate(['main/dashboard']).then(() => {
                    this.projectService.setBaseFileState(null);
                    this.projectService.setlangPropertiesState(null);
                    this.projectService.setLangSettingState(null);
                    this.projectService.setLangInheritanceState(null);
                    this.projectService.setMetaDataState(null);
                    this.projectService.setUserSettingState(null);
                });
            }
        });
    }

    ngOnInit(): void {
        this.baseFileForm = this.fb.group({
            selectBaseFile: ['', Validators.required],
        });
        this.primengConfig.ripple = true;

        this.baseFileSubscription = this.projectService
            .getBaseFileState()
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.projectDetails.push({
                            Name: res.projectName,
                            Id: res.uuid,
                            DataCreationDate: res.date,
                            Creator: res.creator,
                        });
                        this.languageList = res.langsFromXML;
                        this.groupNodeCount = res.groupNodeCount;
                        this.textNodeCount = res.textNodeCount;
                        this.variants = res.variants;
                        this.uploadedXmlFile = res.xmlFile;
                        this.projectName = res.projectName;
                        this.fileSize = res.xmlFile.size;
                        this.hide = true;
                        this.isValid = true;
                        this.isFileSelected = true;
                        this.hideCancelPopup = true;
                    }
                },
            });

        this.langPropsSubscription = this.projectService
            .getlangPropertiesState()
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.projectProperties = res;
                    }
                },
            });

        this.projectService
            .getPlaceholders()
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response) => {
                    if (response) {
                        this.defaultPlaceholders = response['data'];
                    }
                },
            });
    }

    ngOnDestroy() {
        this.baseFileSubscription.unsubscribe();
        this.routerSubs.unsubscribe();
        this.langPropsSubscription.unsubscribe();
    }

    get formControl() {
        return this.baseFileForm.controls;
    }

    onReject() {
        this.messageService.clear('c');
    }

    hideCancel() {
        this.hideCancelPopup = false;
    }
    showCancel() {
        this.isFileSelected = false;
        this.hideCancelPopup = true;
    }

    showConfirm() {
        if (this.hideCancelPopup) {
            this.messageService.clear();
            this.messageService.add({
                key: 'c',
                sticky: true,
                severity: 'warn',
                summary: 'The data may be lost if you cancel the project creation. Are you sure you want to cancel?',
            });

            this.confirmationService.confirm({
                message: 'The data may be lost if you cancel the project creation. Are you sure you want to cancel?',
                header: 'Create Project',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.projectService.closeCreateDialog();
                    this.router.navigate(['main/dashboard']);
                    this.projectService.setBaseFileState(null);
                    this.projectService.setlangPropertiesState(null);
                    this.projectService.setLangSettingState(null);
                    this.projectService.setLangInheritanceState(null);
                    this.projectService.setMetaDataState(null);
                    this.projectService.setUserSettingState(null);
                },
                reject: () => {
                    this.msgs = [
                        {
                            severity: 'info',
                            summary: 'Rejected',
                            detail: 'You have rejected',
                        },
                    ];
                },
            });
        } else {
            this.router.navigate(['main/dashboard']);
            this.projectService.closeCreateDialog();
        }
    }

    nextPage() {
        this.projectService.setBaseFileState({
            uuid: this.projectDetails[0].Id,
            langsFromXML: this.languageList,
            xmlFile: this.uploadedXmlFile,
            groupNodeCount: this.groupNodeCount,
            textNodeCount: this.textNodeCount,
            variants: this.variants,
            projectName: this.projectDetails[0].Name,
            date: this.projectDetails[0].DataCreationDate,
            creator: this.projectDetails[0].Creator,
            projectDetails: this.projectDetails[0],
            projectFlow: 'create',
            placeholders: this.supplierPlaceholders.concat(this.defaultPlaceholders),
        });
        this.router.navigate(['main/dashboard/properties-of-project']);
    }
    // HMI xml parser code start
    getFilename(name: any) {
        return name.substring(0, name.lastIndexOf('.'));
    }
    getFileExtension(fileName: any) {
        return fileName != '' && fileName != undefined && fileName != null ? fileName.split('.').pop() : '';
    }
    hideContent() {
        this.isFileSelected = false;
    }

    selectFile(event: any) {
        this.loadingFileSpinner = true;
        this.uploadedXmlFile = event.files[0];
        this.validateXml = new FormData();
        this.validateXml.append('xml_file', this.uploadedXmlFile, this.uploadedXmlFile.name);

        if (this.getFileExtension(this.uploadedXmlFile.name) != 'xml') {
            this.wrongXml = 'Invalid XML, Please upload valid XML file';
            setTimeout(() => (this.loadingFileSpinner = false), 1000);
            this.wrongXmlFile = true;
            this.parserResult = false;
            this.validationResult = false;
            this.validationError = false;
            this.ErrorInXml = false;
            this.hide = false;
            this.errorListContainer = true;
            this.disableNext = true;
            this.errorContainer = true;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.showHide = true;
            const xml = e.target.result;
            const doc = parser.parseFromString(xml, 'application/xml');
            const errorNode = doc.querySelector('parsererror');
            if (errorNode) {
                this.parserError = errorNode.getElementsByTagName('div')[0].outerText;
                this.parserError = this.parserError.replace('e', 'E');
                setTimeout(() => (this.loadingFileSpinner = false), 1000);
                this.parserRes = this.parserError;
                this.parserResult = true;
                this.wrongXmlFile = false;
                this.validationResult = false;
                this.validationError = false;
                this.errorListContainer = false;
                this.hide = false;
                this.ErrorInXml = false;
                this.disableNext = true;
                this.errorContainer = true;
            }
            const result1 = converter.xml2json(xml, { compact: true, spaces: 2 });
            const JSONData: any = JSON.parse(result1);

            this.uploadXmlService.validateXml('validate-xml', this.validateXml).subscribe((data: any) => {
                this.loadingFileSpinner = true;
                this.disableButton = data.status;
                if (data.status == 'OK') {
                    this.isNextDesabled = false;
                    this.statusMessage = data.message;
                    this.validationResult = true;
                    this.wrongXmlFile = false;
                    this.validationError = false;
                    this.parserResult = false;
                    this.hide = true;
                    this.errorListContainer = false;
                    this.ErrorInXml = false;
                    this.disableNext = false;
                    this.loadingFileSpinner = false;
                    this.errorContainer = false;
                } else if (data.status == 'NOK') {
                    setTimeout(() => (this.loadingFileSpinner = false), 1000);
                    this.isNextDesabled = true;
                    let xmlData;
                    this.errorMessage = data.message;
                    this.validationResult = false;
                    this.validationError = true;
                    this.wrongXmlFile = false;
                    this.parserResult = false;
                    this.errorListContainer = true;
                    this.ErrorInXml = true;
                    this.errorContainer = true;
                    xmlData = JSON.stringify(data.error);
                    xmlData = xmlData.replace(/"/g, '');
                    const splitString = xmlData.split('.,');
                    const arrayData = [];
                    arrayData.push(splitString);
                    arrayData.forEach((element) => {
                        this.xmlError = element;
                    });
                    this.hide = false;
                    this.hideCancelPopup = false;
                }
            });

            const form_data = new FormData();
            form_data.append('xml_data', this.uploadedXmlFile);
            this.projectService.getNodeCount(form_data).subscribe((res) => {
                if (res) {
                    const nodeResp = JSON.parse(JSON.stringify(res));
                    const [{ group_count }, { lengthCalculationIds }, { text_count }, { variants }] = [
                        ...nodeResp.data,
                    ];
                    this.textNodeCount = text_count;
                    this.groupNodeCount = group_count;
                    this.variants = variants;
                    this.projectService.lengthCalculationIds = lengthCalculationIds;
                }
            });

            this.languageList = [];
            this.languageInheritanceList = [];

            if (Array.isArray(JSONData.SupplierXML.Project.LanguageManager.Language)) {
                for (const lang of JSONData.SupplierXML.Project.LanguageManager.Language) {
                    const languageData: any = {
                        Name: lang._attributes.Name,
                        Id: lang._attributes.Id,
                    };
                    const languageIngeritanceData = {
                        language_id: lang._attributes.Id,
                        language_name: lang._attributes.Name,
                        parent_language_id: '',
                        parent_language_name: '',
                    };
                    this.languageList.push(languageData);
                    this.languageInheritanceList.push(languageIngeritanceData);
                }
            }

            this.supplierPlaceholders.length = 0;
            this.supplierPlaceholders = this.getPlaceholdersFromXML(JSONData);

            this.projectDetails = [];
            const projectData = JSONData.SupplierXML.Project._attributes;
            this.projectDetails.push(projectData);
            this.postObj = {
                project_id: this.projectDetails[0]['Id'],
            };
            this.projectNameuniqueness();
            this.projectService.setLangInheritanceState(this.languageInheritanceList);

            if (this.projectProperties) {
                this.projectProperties.projectName = JSONData?.SupplierXML?.Project?._attributes?.Name;
                this.projectProperties.mainDefinitionPlaceHolder = this.supplierPlaceholders.concat(
                    this.defaultPlaceholders
                );
            }
            this.projectService.setlangPropertiesState(this.projectProperties);
        };
        reader.readAsText(event.files[0]);
    }

    projectNameuniqueness() {
        this.projectService
            .checkProjectName(this.postObj)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res) {
                        const projectData = JSON.stringify(res);
                        const jsonObj = JSON.parse(projectData);
                        this.errorMsg = jsonObj.message;
                        if (jsonObj.status == 'OK') {
                            this.msgs1 = [];
                            this.isValid = true;
                            this.msgs1 = [];
                        } else {
                            this.isValid = false;
                            this.hideCancelPopup = false;
                            this.msgs1 = [
                                {
                                    severity: 'error',
                                    detail: `Project ID is not available and currently is being used. Please use different Project ID.`,
                                },
                            ];
                        }
                        this.errorMesg = jsonObj.message;
                    }
                },
            });
    }

    private getPlaceholdersFromXML(JSONData) {
        const placeholdersFromXML =
            JSONData.SupplierXML.Project?.PlaceholderManager?.ExpectedPlaceholders?.ExpectedPlaceholder;

        if (!placeholdersFromXML || !Array.isArray(placeholdersFromXML)) {
            return [];
        }

        return placeholdersFromXML.map((placeholder) => {
            const symbol = placeholder?._attributes?.UserdefinedType ?? placeholder._attributes.Type;
            const placeholderIndex = this.defaultPlaceholders.findIndex((p) => p.symbol === symbol);

            if (placeholderIndex > -1) {
                this.defaultPlaceholders.splice(placeholderIndex, 1);
            }

            return {
                symbol,
                isActive: true,
                canDelete: placeholder._attributes.Type === 'Userdefined',
            };
        });
    }
    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }
}
