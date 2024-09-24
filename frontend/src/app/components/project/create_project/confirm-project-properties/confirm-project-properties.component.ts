import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, Message, PrimeNGConfig } from 'primeng/api';
import { Subscription, catchError, combineLatest, of, switchMap } from 'rxjs';
import { DashboardComponent } from 'src/app/components/dashboard/editor/dashboard.component';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { GrammarParserConfigurationService } from 'src/app/core/services/resource/grammar-parser-configuration.service';
import { ResourceService } from 'src/app/core/services/resource/resource.service';
import { UserService } from 'src/app/core/services/user/user.service';
@Component({
    selector: 'app-confirm-project-properties',
    templateUrl: './confirm-project-properties.component.html',
    styleUrls: ['./confirm-project-properties.component.scss'],
})
export class ConfirmProjectPropertiesComponent implements OnInit, OnDestroy {
    // Popups and information
    minDateValue = new Date();
    displayScheduleProject!: boolean;
    msgs1: Message[] = [];
    isResponseOk;
    confirmationData;
    isSpinner = false;
    scheduleTime;
    disableSchedule: boolean;
    msgs: Message[];
    user_id;
    flatArray = [];
    projectMetadataObj;
    langObj;
    newProjectID;
    versionID;
    mapped_language;
    language_id;
    langObjectArray = [];
    mappedLangArray = [];
    due_date;
    flatLanguageArray = [];
    parentLanguageId = '';
    parentLanguageName = '';
    getLanguageInheritance = [];
    flatLanguageInheritanceArray = [];
    langInheritanceObj;
    userInfo;
    xmlFile;
    isMetadataUploaded;
    variants = [];
    variantString;
    projectName;
    existingProjectID;
    date;
    variant;
    creator;
    groupNodeCount;
    textNodeCount;
    projectNameUpdated;
    brand;
    type;
    translationRole;
    mainDefination;
    finalDelivary;
    projectDescription;
    languageFromXml;
    languageFromUser;
    editorsLanguage;
    languageMappedByUser;
    directoriesOfMenuGraphics;
    defaultLengthCalculationsOfVectorFonts;
    directoriesOfConfigurationFilesForSDSChecker;
    miscellaneousDocuments;

    payloadSubscription: Subscription;
    editor_language;
    payload: any = {};

    constructor(
        private router: Router,
        private primengConfig: PrimeNGConfig,
        private projectService: ProjectService,
        private userService: UserService,
        private dashboardComponent: DashboardComponent,
        private confirmationService: ConfirmationService,
        private resourceService: ResourceService,
        private parserConfigurationService: GrammarParserConfigurationService
    ) {}

    ngOnInit(): void {
        this.isSpinner = false;

        const baseFileState = this.projectService.getBaseFileState();
        const projectPropertiesState = this.projectService.getlangPropertiesState();
        const langSettingState = this.projectService.getLangSettingState();
        const langInheritanceState = this.projectService.getLangInheritanceState();
        const lcAndFontState = this.projectService.getLcAndFontState();
        const screenShotState = this.resourceService.getResourceState();
        const usersSettingState = this.projectService.getUserSettingState();
        const parseConfigurationState = this.projectService.getParseConfigurationState();

        const payload$ = combineLatest([
            baseFileState,
            projectPropertiesState,
            langSettingState,
            langInheritanceState,
            lcAndFontState,
            screenShotState,
            usersSettingState,
            parseConfigurationState,
        ]);
        this.payloadSubscription = payload$.subscribe(
            ([
                baseFileRes,
                projectPropertiesRes,
                langSettingRes,
                langInheritanceRes,
                lcAndFontState,
                screenShotState,
                usersSettingRes,
                parseConfigurationState,
            ]) => {
                this.payload = {
                    ...baseFileRes,
                    ...projectPropertiesRes,
                    ...langSettingRes,
                    langInheritance: langInheritanceRes,
                    ...lcAndFontState,
                    resourceUploadData: screenShotState?.data,
                    ...usersSettingRes,
                    gpConfigIds: parseConfigurationState.parseConfigurationDetailsModel.map(
                        (parseConfiguration) => parseConfiguration?.gpConfigId
                    ),
                };
                const varArray = this.payload.variants.map((variant) => variant);
                this.payload = { ...this.payload, variants: varArray.join() };
                this.payload = {
                    user_id: this.userService.getUser().id,
                    ...this.payload,
                };
                this.setParentNull(this.payload.langInheritance);
                this.payload = {
                    language_inheritance_tree: this.payload.langInheritance,
                    ...this.payload,
                };

                this.flatLanguageArray = this.convertTreeArrayToFlatArray(
                    this.payload.langInheritance,
                    this.parentLanguageId,
                    this.parentLanguageName
                );

                const flatLanguageInheritanceArray = this.flatLanguageArray.map((lang) => ({
                    language_id: lang.language_id,
                    language_name: lang.language_name,
                    parent_language_id: lang.parent_language_id,
                    parent_language_name: lang.parent_language_name,
                }));

                this.payload = {
                    language_inheritance: flatLanguageInheritanceArray,
                    ...this.payload,
                };

                this.mappedLangArray = this.payload.mappedLangs;
                this.mapped_language = this.mappedLangArray.map((res: any) => {
                    return res.language_culture_name;
                });
                this.language_id = this.mappedLangArray.map((res: any) => {
                    return res.language_id;
                });

                this.langObjectArray = this.payload.langsFromXML.map((lang, index) => ({
                    language_id: this.language_id[index],
                    xml_language: lang.Name,
                    mapped_language: this.mapped_language[index],
                }));

                this.payload = { ...this.payload, mappedLangs: this.langObjectArray };
                const editorSelectedlang = this.payload.mappedLangs.find(
                    (lang) => lang.xml_language === this.payload.translationLanguage.Name
                );
                this.payload.translationLanguage.Id = editorSelectedlang.language_id;

                for (const element of this.payload.language_inheritance) {
                    const mappedLanguages = this.payload.mappedLangs.find(
                        (lang) => lang.xml_language === element.language_name
                    );

                    if (mappedLanguages) {
                        element.language_id = mappedLanguages.language_id;

                        const languagesInheritance = this.payload.language_inheritance.find(
                            (lang) => lang.parent_language_name === element.language_name
                        );

                        if (languagesInheritance) {
                            languagesInheritance.parent_language_id = mappedLanguages.language_id;
                        }
                    }
                }
            }
        );

        this.msgs1 = [
            {
                severity: 'warn',
                summary: 'Confirmation',
                detail: 'Please confirm all the properties you have entered for project creation is right. ',
            },
        ];

        this.primengConfig.ripple = true;
    }

    setParentNull(arr) {
        for (const node of arr) {
            node.parent = null;
            if (node?.['children']) {
                this.setParentNull(node.children);
            }
        }
    }

    ngOnDestroy() {
        this.payloadSubscription.unsubscribe();
    }

    convertTreeArrayToFlatArray(arg, parentId, parentName) {
        return arg.flatMap((lang) => [
            { ...lang, parent_language_id: parentId, parent_language_name: parentName },
            ...(lang?.children && lang.children.length > 0
                ? this.convertTreeArrayToFlatArray(lang.children, lang.language_id, lang.language_name)
                : []),
        ]);
    }
    showConfirm() {
        this.confirmationService.confirm({
            message: 'The data may be lost if you cancel the project creation. Are you sure you want to cancel?',
            header: 'Cancel Project',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.projectService.closeCreateDialog();
                this.router.navigate(['main/dashboard']);
                this.resetStates();
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
    }

    // Convert date in to 'YYYY-MM-DD'
    convertDateFormat(date: any) {
        const due_date = new Date(date),
            month = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return [due_date.getFullYear(), month, day].join('-');
    }

    uploadProjectCreationData() {
        this.dashboardComponent.callFromChildPropertiesofProject(this.payload, '');
        this.isSpinner = true;

        const formData = this.buildFormData();
        const form_data = this.convertToFormData(formData);

        this.projectService
            .createProject(form_data)
            .pipe(
                catchError((error) => of(error)),
                switchMap((res) => {
                    return combineLatest([
                        this.handleCreateProjectResponse(res),
                        this.handleScreenshotUploadResponse(res),
                    ]);
                })
            )
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .subscribe(([_createProjectResponse, screenshotUploadResponse]) => {
                if (screenshotUploadResponse?.['status'] === 'OK') {
                    this.resourceService.setResourceState({
                        data: this.payload.resourceUploadData,
                        isScreenshotUploadInProgress: false,
                        isScreenshotReportDownloadButtonVisible: true,
                    });
                }
                this.resetStates();
            });
    }

    handleScreenshotUploadResponse(res) {
        if (res && this.payload.resourceUploadData?.file) {
            this.resourceService.setResourceState({
                data: this.payload.resourceUploadData,
                isScreenshotUploadInProgress: true,
                isScreenshotReportDownloadButtonVisible: false,
            });
            return this.resourceService.uploadFile(
                `screenshot/project/${this.newProjectID}/screenshots`,
                this.payload.resourceUploadData
            );
        }
        this.resetStates();
        return of(undefined);
    }

    private buildFormData() {
        return {
            existing_project_id: this.payload.uuid,
            title: this.payload.projectName,
            group_node_count: this.payload.groupNodeCount,
            brand_id: this.payload?.brand?.id,
            project_type: this.payload?.project_type?.id,
            editor_language: this.payload.translationLanguage.Id,
            placeholder: JSON.stringify(this.payload.mainDefinitionPlaceHolder),
            translation_role: this.payload.translationRole,
            label_id: 1,
            due_date: this.payload.finalDelivery ? this.convertDateFormat(this.payload.finalDelivery) : '',
            description: this.payload.description,
            readOnlyUsers: JSON.stringify(this.payload.readOnlyUsers),
            text_node_counts: this.payload.textNodeCount,
            creator: this.payload.creator,
            xml_data: this.payload.xmlFile,
            parent_project_id: 0,
            user_id: this.payload.user_id,
            status: 'new',
            is_metadata: 0,
            variant: this.payload.variants,
            font_id: this.payload?.defaultFontPackages,
            lengthCalculationIds: JSON.stringify(this.payload?.defaultLengthCalculationsOfVectorFonts),
            project_manager_id: this.getManagerId(),
            project_manager_email: this.getManagerEmail(),
            language_mapping: JSON.stringify(this.payload.mappedLangs),
            language_inheritance: JSON.stringify(this.payload.language_inheritance),
            language_inheritance_tree: JSON.stringify(this.payload.language_inheritance_tree),
            gpConfigIds: JSON.stringify(this.payload?.gpConfigIds?.filter((id) => id)),
        };
    }

    private convertToFormData(formData): FormData {
        const form_data = new FormData();
        for (const key in formData) {
            form_data.append(key, formData[key]);
        }
        return form_data;
    }

    private handleCreateProjectResponse(res) {
        if (res) {
            const projectData = JSON.stringify(res);
            const jsonObj = JSON.parse(projectData);
            this.isResponseOk = jsonObj.status;
            if (this.isResponseOk === 'OK') {
                this.isSpinner = false;
                this.newProjectID = jsonObj.data[0].project_id;
                this.versionID = jsonObj.data[0].version_no;
                const metaData = this.buildMetaDataFormData();
                return this.projectService.uploadMetaData(metaData).pipe(catchError(() => of(undefined)));
            }
        }
        this.resetStates();
        return of(undefined);
    }

    private buildMetaDataFormData(): FormData {
        const metaData = new FormData();
        metaData.append('project_id', this.newProjectID);
        metaData.append('version_no', this.versionID);
        metaData.append('length_calculation_id', this.payload?.defaultLengthCalculationsOfVectorFonts);
        metaData.append('font_id', this.payload?.defaultFontPackages);
        return metaData;
    }

    private getManagerId() {
        return this.payload.selectedManager.id !== undefined ? this.payload.selectedManager.id : 0;
    }

    private getManagerEmail() {
        return this.payload.selectedManager.email != undefined ? this.payload.selectedManager.email : '';
    }

    private resetStates() {
        this.projectService.setBaseFileState(null);
        this.projectService.setlangPropertiesState(null);
        this.projectService.setLangSettingState(null);
        this.projectService.setLangInheritanceState(null);
        this.projectService.setMetaDataState(null);
        this.projectService.setUserSettingState(null);
    }

    // Navigate to previous page
    prevPage() {
        this.router.navigate(['main/dashboard/users']);
    }
    showScheduleProject() {
        this.displayScheduleProject = true;
    }
    closeSchedule() {
        this.displayScheduleProject = false;
    }

    getScheduleTime(e) {
        if (e) {
            const utcDate = new Date(e);
            let month: any = utcDate.getUTCMonth() + 1; //months from 1-12
            if (month < 10) {
                month = '0' + month;
            }
            let day: any = utcDate.getUTCDate();
            if (day < 10) {
                day = '0' + day;
            }
            const year = utcDate.getUTCFullYear();
            const hours = utcDate.getUTCHours();
            const minutes = utcDate.getUTCMinutes();
            const seconds = utcDate.getUTCSeconds();
            this.scheduleTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        this.disableSchedule = true;
    }

    scheduleMassOperation() {
        this.dashboardComponent.callFromChildPropertiesofProject(this.payload, 'SCHEDULE');
        const formData = {
            existing_project_id: this.payload.uuid,
            title: this.payload.projectName,
            group_node_count: this.payload.groupNodeCount,
            brand_id: this.payload.brand.id,
            project_type: this.payload?.project_type?.id,
            editor_language: this.payload.translationLanguage.Id,
            translation_role: this.payload.translationRole,
            placeholder: JSON.stringify(this.payload.mainDefinitionPlaceHolder),
            label_id: 1,
            due_date: this.payload.finalDelivery ? this.convertDateFormat(this.payload.finalDelivery) : '',
            description: this.payload.description !== undefined ? this.payload.description : '',
            text_node_counts: this.payload.textNodeCount,
            creator: this.payload.creator,
            readOnlyUsers: JSON.stringify(this.payload.readOnlyUsers),
            xml_data: this.payload.xmlFile,
            parent_project_id: 0,
            user_id: this.payload.user_id,
            status: 'new',
            is_metadata: 0,
            metadata: this.payload.metadataObj,
            variant: this.payload.variants,
            project_manager_id: this.payload.selectedManager.id !== undefined ? this.payload.selectedManager.id : 0,
            project_manager_email:
                this.payload.selectedManager.email != undefined ? this.payload.selectedManager.email : '',
            schedule_datetime: this.scheduleTime,
            language_mapping: JSON.stringify(this.payload.mappedLangs),
            language_inheritance: JSON.stringify(this.payload.language_inheritance),
            language_inheritance_tree: JSON.stringify(this.payload.language_inheritance_tree),
        };

        const form_data = new FormData();
        for (const key in formData) {
            form_data.append(key, formData[key]);
        }
        this.projectService.postScheduleMassOperation(form_data).subscribe({
            next: (res) => {
                this.dashboardComponent.onLoad();
                this.resetStates();
                if (res == undefined) {
                    this.msgs = [
                        {
                            severity: 'success',
                            detail: `The mass operation is scheduled successfully. It will run at scheduled time`,
                        },
                    ];
                }
            },
            error: () => {
                this.resetStates();
            },
        });
    }
}
