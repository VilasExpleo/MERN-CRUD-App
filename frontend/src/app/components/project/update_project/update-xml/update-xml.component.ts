import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, Message, PrimeNGConfig } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { DashboardComponent } from 'src/app/components/dashboard/editor/dashboard.component';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { UploadxmlService } from 'src/app/core/services/xml/uploadxml/uploadxml.service';

import * as converter from 'xml-js';
const parser = new DOMParser();
@Component({
    selector: 'app-update-xml',
    templateUrl: './update-xml.component.html',
    styleUrls: ['./update-xml.component.scss'],
    providers: [ConfirmationService],
})
export class UpdateXmlComponent implements OnInit {
    finalUpdateProjectDetails;
    projectDetails = [];
    isNextDesabled = true;
    isFileSelected = false;
    projectTranslateID;
    newXmlFile: File;
    fileName;
    fileSize;
    projectVersion;
    projectById;
    newAddedLanguages;
    newProjectName;
    newProjectDate;
    newProjectLanguages;
    newProjectVariants;
    newProjectGroupNodeCount;
    newProjectTextNodeCount;
    oldProjectTextNodeCount;
    oldProjectGroupNodeCount;
    oldProjectName;
    oldProjectDate;
    oldProjectLanguages;
    oldProjectVariants;
    xml_difference;
    xmlDifferenceRes;
    languageDiffrence;
    projectUpdateDetails;
    oldLangCount = 0;
    newLangCount = 0;
    isCountVisible = false;
    xmlDiffrence;

    groupnodeAdded;
    groupnodeDeleted;
    changedEntries;
    languageDeleted;
    textnodeDeleted;
    textnodeAdded;
    structureEntries: string;
    changeEntries: string;

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
    existingProjectId;
    postObj;
    isValid: boolean;
    msgs1: Message[];
    msgs: Message[] = [];
    hideCancelPopup = false;
    isMsgVisible = false;
    textnodeChangeEntries: string;
    userInfo;
    postUserId;
    constructor(
        private projectService: ProjectService,
        private router: Router,
        private primengConfig: PrimeNGConfig,
        private route: ActivatedRoute,
        private dashboardComponent: DashboardComponent,
        private uploadXmlService: UploadxmlService,
        private fileUploadService: FileUploadService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.projectTranslateID = params['id'];
        });
        this.projectService
            .getProject(this.projectTranslateID)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res) {
                    this.projectById = res;
                    this.projectVersion = this.projectById?.data?.properties[0]['version_no'];
                }
            });
        this.projectUpdateDetails = this.projectService.getProjectUpdateDetailsData();
        this.primengConfig.ripple = true;
        this.getPreviousDetails();
        if (this.projectUpdateDetails.newProjectName) {
            this.isFileSelected = true;
        }
    }
    getPreviousDetails() {
        if (this.projectUpdateDetails?.newXmlFile?.arguments) {
            this.fileName = '';
        }
        if (this.projectUpdateDetails.newProjectName) {
            this.fileName = this.projectUpdateDetails.newXmlFile.name;
            this.fileSize = this.projectUpdateDetails.newXmlFile.size;
        }
        this.newProjectName = this.projectUpdateDetails.newProjectName;
        this.newProjectDate = this.projectUpdateDetails.newProjectDate;
        this.newProjectLanguages = this.projectUpdateDetails.newProjectLanguages;
        this.newProjectVariants = this.projectUpdateDetails.newProjectVariants;

        this.oldProjectName = this.projectUpdateDetails.oldProjectName;
        this.oldProjectDate = this.projectUpdateDetails.oldProjectDate;
        this.oldProjectLanguages = this.projectUpdateDetails.oldProjectLanguages;
        this.oldProjectVariants = this.projectUpdateDetails.oldProjectVariants;
        this.languageDiffrence = this.projectUpdateDetails.languageDiffrence;
        this.oldLangCount = this.projectUpdateDetails.oldLangCount;
        this.newLangCount = this.projectUpdateDetails.newLangCount;

        this.groupnodeAdded = this.projectUpdateDetails.groupnodeAdded;
        this.groupnodeDeleted = this.projectUpdateDetails.groupnodeDeleted;
        this.changedEntries = this.projectUpdateDetails.changedEntries;
        this.languageDeleted = this.projectUpdateDetails.languageDeleted;
        this.textnodeDeleted = this.projectUpdateDetails.textnodeDeleted;
        this.textnodeAdded = this.projectUpdateDetails.textnodeAdded;
        this.oldProjectGroupNodeCount = this.projectUpdateDetails.oldProjectGroupNodeCount;
        this.oldProjectTextNodeCount = this.projectUpdateDetails.oldProjectTextNodeCount;
        this.newProjectGroupNodeCount = this.projectUpdateDetails.newProjectGroupNodeCount;
        this.newProjectTextNodeCount = this.projectUpdateDetails.newProjectTextNodeCount;
        this.structureEntries = this.projectUpdateDetails.structureEntries;
        this.changeEntries = this.projectUpdateDetails.changeEntries;
        this.textnodeChangeEntries = this.projectUpdateDetails.textnodeChangeEntries;

        if (this.projectUpdateDetails.newProjectName != '') {
            this.isNextDesabled = false;
            this.isCountVisible = true;
            this.isValid = true;
            this.hideCancelPopup = true;
        }
    }
    clearFileData() {
        this.newProjectName = '';
        this.newProjectDate = '';
        this.newProjectLanguages = '';
        this.newProjectVariants = '';

        this.oldProjectName = '';
        this.oldProjectDate = '';
        this.oldProjectLanguages = '';
        this.oldProjectVariants = '';
        this.languageDiffrence = '';
        this.oldLangCount = 0;
        this.newLangCount = 0;

        this.groupnodeAdded = '';
        this.groupnodeDeleted = '';
        this.changedEntries = '';
        this.languageDeleted = '';
        this.textnodeDeleted = '';
        this.textnodeAdded = '';
        this.textnodeChangeEntries = '';
        this.isCountVisible = false;
        this.msgs1 = [];
    }
    hideCancel() {
        this.hideCancelPopup = false;
    }
    showCancel() {
        this.hideCancelPopup = true;
        this.isFileSelected = false;
    }
    showConfirm() {
        this.dashboardComponent.closeDialogeOnCancel();
        this.router.navigate(['main/dashboard']);
        this.projectService.setProjectUpdateDetailsData('');
    }
    nextPage() {
        this.router.navigate([`main/dashboard/update-configuration/${this.projectTranslateID}`]);
    }
    // HMI xml parser code start

    getFilename(name: any) {
        return name.substring(0, name.lastIndexOf('.'));
    }
    getFileExtension(fileName: any) {
        return fileName != '' && fileName != undefined && fileName != null ? fileName.split('.').pop() : '';
    }

    selectFile(event: any) {
        this.clearFileData();
        this.finalUpdateProjectDetails = {};
        this.loadingFileSpinner = true;
        this.newXmlFile = event.files[0];
        this.validateXml = new FormData();
        this.validateXml.append('xml_file', this.newXmlFile, this.newXmlFile.name);

        if (this.getFileExtension(this.newXmlFile.name) != 'xml') {
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
            const JSONData = JSON.parse(result1);
            const projectData = JSONData.SupplierXML.Project._attributes;
            this.postObj = {
                project_id: this.projectTranslateID,
                existing_project_id: projectData.Id,
            };
            this.uploadXmlService.validateXml('validate-xml', this.validateXml).subscribe((data: any) => {
                this.loadingFileSpinner = true;
                this.disableButton = data.status;
                if (data.status === 'OK') {
                    this.statusMessage = data.message;
                    this.validationResult = true;
                    this.wrongXmlFile = false;
                    this.validationError = false;
                    this.parserResult = false;
                    this.hide = true;
                    this.errorListContainer = false;
                    this.ErrorInXml = false;
                    this.disableNext = false;

                    this.errorContainer = false;
                } else {
                    setTimeout(() => (this.loadingFileSpinner = false), 1000);
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
            this.getXmlDiffrence();
        };

        reader.readAsText(event.files[0]);
        this.isNextDesabled = false;
        this.finalUpdateProjectDetails.newXml = this.newXmlFile;
    }

    getXmlDiffrence() {
        this.projectService
            .projectUpdateDatavalidation(this.postObj)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (response?.['status'] === 'OK') {
                    this.isValid = true;
                    this.msgs1 = [];
                    const formData = {
                        xml_data: this.newXmlFile,
                        project_id: this.projectTranslateID,
                        version_no: this.projectVersion,
                    };
                    const form_data = new FormData();
                    for (const key in formData) {
                        form_data.append(key, formData[key]);
                    }
                    this.projectService
                        .getXmlDiffrence(form_data)
                        .pipe(catchError(() => of(undefined)))
                        .subscribe((res) => {
                            if (res) {
                                this.loadingFileSpinner = false;
                                this.xmlDifferenceRes = res;
                                this.xmlDiffrence = this.xmlDifferenceRes.data.xml_difference;
                                const arr = '[{"textnode_deleted":0},{"textnode_added":0}]';
                                if (arr === JSON.stringify(this.xmlDiffrence)) {
                                    this.isMsgVisible = true;
                                } else {
                                    this.isMsgVisible = false;
                                }

                                const deletedLang = [];
                                for (const element of this.xmlDiffrence) {
                                    if (Object.prototype.hasOwnProperty.call(element, 'groupnode_added')) {
                                        this.groupnodeAdded = element.groupnode_added;
                                        this.finalUpdateProjectDetails.groupnodeAdded = element.groupnode_added;
                                    } else if (Object.prototype.hasOwnProperty.call(element, 'changed_entries')) {
                                        this.changedEntries = element.changed_entries;
                                        this.finalUpdateProjectDetails.changedEntries = element.changed_entries;
                                    } else if (Object.prototype.hasOwnProperty.call(element, 'groupnode_deleted')) {
                                        this.groupnodeDeleted = element.groupnode_deleted;
                                        this.finalUpdateProjectDetails.groupnodeDeleted = element.groupnode_deleted;
                                    } else if (Object.prototype.hasOwnProperty.call(element, 'textnode_deleted')) {
                                        this.textnodeDeleted = element.textnode_deleted;
                                        this.finalUpdateProjectDetails.textnodeDeleted = element.textnode_deleted;
                                    } else if (Object.prototype.hasOwnProperty.call(element, 'textnode_added')) {
                                        this.textnodeAdded = element.textnode_added;
                                        this.finalUpdateProjectDetails.textnodeAdded = element.textnode_added;
                                    } else if (
                                        Object.prototype.hasOwnProperty.call(element, 'structure_entries') ||
                                        this.finalUpdateProjectDetails.groupnodeAdded > 0
                                    ) {
                                        this.structureEntries = element['structure_entries'];
                                        this.finalUpdateProjectDetails.structureEntries = element.structure_entries;
                                    } else if (Object.prototype.hasOwnProperty.call(element, 'change_entries')) {
                                        this.changeEntries = element['change_entries'];
                                        this.finalUpdateProjectDetails.changeEntries = element.change_entries;
                                    } else if (Object.prototype.hasOwnProperty.call(element, 'language_deleted')) {
                                        deletedLang.push(element.language_deleted);
                                        this.languageDeleted = deletedLang + '';
                                        this.finalUpdateProjectDetails.languageDeleted = this.languageDeleted;
                                    } else if (
                                        Object.prototype.hasOwnProperty.call(element, 'textnode_change_entries')
                                    ) {
                                        this.textnodeChangeEntries = element['textnode_change_entries'];
                                        this.finalUpdateProjectDetails.textnodeChangeEntries =
                                            element.textnode_change_entries;
                                    }
                                }
                                this.xml_difference = this.xmlDifferenceRes.data.xml_difference;
                                this.oldProjectDate = this.xmlDifferenceRes.data.old_xml[0]['date'];
                                this.oldProjectName = this.xmlDifferenceRes.data.old_xml[0]['title'];
                                this.oldProjectLanguages = this.xmlDifferenceRes.data.old_xml[0]['language'];
                                const oldLang = this.oldProjectLanguages.split(',');
                                this.oldLangCount = oldLang.length;
                                this.oldProjectVariants = this.xmlDifferenceRes.data.old_xml[0]['variants'];
                                this.oldProjectGroupNodeCount = this.xmlDifferenceRes.data.old_xml[0]['groupNodeCount'];
                                this.oldProjectTextNodeCount = this.xmlDifferenceRes.data.old_xml[0]['textNodeCount'];

                                this.newProjectName = this.xmlDifferenceRes.data.new_xml[0]['title'];
                                this.newProjectDate = this.xmlDifferenceRes.data.new_xml[0]['date'];
                                this.newProjectLanguages = this.xmlDifferenceRes.data.new_xml[0]['language'];
                                this.newProjectVariants = this.xmlDifferenceRes.data.new_xml[0]['variants'];
                                this.newProjectGroupNodeCount = this.xmlDifferenceRes.data.new_xml[0]['groupNodeCount'];
                                this.newProjectTextNodeCount = this.xmlDifferenceRes.data.new_xml[0]['textNodeCount'];
                                const arrayNew = this.newProjectLanguages.split(',');
                                this.newLangCount = arrayNew.length;
                                const arrayOld = this.oldProjectLanguages.split(',');
                                this.newAddedLanguages = arrayNew.filter((e) => !arrayOld.includes(e));
                                this.languageDiffrence = this.newAddedLanguages + '';

                                this.finalUpdateProjectDetails.xml_difference = this.xml_difference;
                                this.finalUpdateProjectDetails.oldProjectDate = this.oldProjectDate;
                                this.finalUpdateProjectDetails.oldProjectName = this.oldProjectName;
                                this.finalUpdateProjectDetails.oldProjectVariants = this.oldProjectVariants;
                                this.finalUpdateProjectDetails.oldProjectLanguages = this.oldProjectLanguages;
                                this.finalUpdateProjectDetails.oldProjectGroupNodeCount = this.oldProjectGroupNodeCount;
                                this.finalUpdateProjectDetails.oldProjectTextNodeCount = this.oldProjectTextNodeCount;

                                this.finalUpdateProjectDetails.newProjectName = this.newProjectName;
                                this.finalUpdateProjectDetails.newProjectDate = this.newProjectDate;
                                this.finalUpdateProjectDetails.newProjectVariants = this.newProjectVariants;
                                this.finalUpdateProjectDetails.newProjectLanguages = this.newProjectLanguages;
                                this.finalUpdateProjectDetails.languageDiffrence = this.languageDiffrence;
                                this.finalUpdateProjectDetails.projectVersion = this.projectVersion;
                                this.finalUpdateProjectDetails.projectById = this.projectById;
                                this.finalUpdateProjectDetails.xmlDifferenceRes = this.xmlDifferenceRes;
                                this.finalUpdateProjectDetails.oldLangCount = this.oldLangCount;
                                this.finalUpdateProjectDetails.newLangCount = this.newLangCount;
                                this.finalUpdateProjectDetails.newProjectGroupNodeCount = this.newProjectGroupNodeCount;
                                this.finalUpdateProjectDetails.newProjectTextNodeCount = this.newProjectTextNodeCount;
                                this.isCountVisible = true;
                                this.projectService.setProjectUpdateDetailsData(this.finalUpdateProjectDetails);
                            }
                        });
                } else {
                    this.loadingFileSpinner = false;
                    this.isValid = false;
                    this.hideCancelPopup = false;
                    this.msgs1 = [
                        {
                            severity: 'error',
                            detail: `Project ID is different. The project id is required to be same to update the project.`,
                        },
                    ];
                }
            });
    }
    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }
}
