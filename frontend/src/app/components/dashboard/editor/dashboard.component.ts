/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { ConfirmationService, MenuItem, Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { io } from 'socket.io-client';
import { ProjectStatusEnum, StatusKey } from 'src/Enumerations';
import { DateService } from 'src/app/core/services/date/date.service';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { OrderReviewStateModel } from 'src/app/core/services/order-review/order-review.model';
import { OrderReviewService } from 'src/app/core/services/order-review/order-review.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { ProjectUpdateService } from 'src/app/core/services/project/project-update.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ReportService } from 'src/app/core/services/reports/report.service';
import { LocalStorageService } from 'src/app/core/services/storage/local-storage.service';
import { ChecklistService } from 'src/app/core/services/translation-request/checklist.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { ProjectModel } from 'src/app/shared/models/project/project';
import { environment } from '../../../../environments/environment';
import { ProjectPropertiesComponent } from '../../project/project-properties/project-properties.component';
import { DeleteCommentsComponent } from '../delete-comments/delete-comments.component';
import { LabelManagerComponent } from '../label-manager/label-manager.component';
import { OrderReviewComponent } from '../order-review/order-review.component';
import { TranslationRequestComponent } from '../translation-request/editor-translation-request/translation-request.component';
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['../dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
    contextMenuItems: MenuItem[] = [];
    projectCreationStepitems: MenuItem[] = [];
    projectTranslationItems: MenuItem[] = [];
    products: ProjectModel[] = [];
    selectedProduct: ProjectModel;
    display = false;
    displayStepDialoge = false;
    propertiesOfProject = false;
    showNewVersion = false;
    date = Date();
    displayPrepareDialog = false;
    editorsProject;
    userInfo;
    postUserId;
    projectTitle;
    projectProgressDetails;
    projectProgressValue;
    editorsProjects;
    value = 0;
    id;
    isError = false;
    displayProjectDeatils = false;
    prgressbar = {};
    storedMassData = [];
    previousProgress = 0;
    urlWebSocket = `${environment.webSocket}`;
    currentDate = new Date();
    projectDetails = [];
    loading = false;
    progressDetails;
    editSetTitle;
    progress;
    progress_status;
    infoData = [];
    errorData = [];
    warningData = [];
    showAcceptRejectBtn = true;
    deleteOnRejectId;
    isAbortOperationID;
    viewDetails = false;
    project_title;
    project_status;
    dateDifference;
    due_date;
    showDateBellIcon = [];
    projectUpdateStepitems: MenuItem[] = [];
    msgs: Message[] = [];
    loadingDashboradDetails = false;
    project_version;
    isMappingAssistent = true;
    projectUpdatedDialog = false;
    showProjectError = true;
    existing_Project_Id;
    items;
    tzNames: string;
    viewSetting = false;
    selectedPid: number;
    editorLanguage: string;
    displayTraslationDialog = false;
    isPopupMaximized = false;
    translationImport = false;
    viewPageLine = 10;
    activityValues = [0, 100];
    selectedProject = {};
    IgcDockManagerLayout = {};
    ref: object;
    state;
    translationRequestId;
    newVersionForm!: UntypedFormGroup;
    destroyed$ = new Subject<boolean>();
    documentCount: number;
    translationAllData = {};
    projectStatus = ProjectStatusEnum;

    // @ViewChild('content') elementView: ElementRef;
    //--------------------Export----------------------
    export = false;
    exportProjectName: string;
    //-------------------------------------------------
    isStatusOK = false;
    isOrderReview = false;
    checklist: ChecklistModel[];
    isRawProject = false;
    isDCProject = false;
    isDCProjectStatusWiseMessage = 'The raw project from the data creator is available for project creation.';
    constructor(
        private router: Router,
        private messageService: MessageService,
        private projectService: ProjectService,
        private userService: UserService,
        private localStorageService: LocalStorageService,
        private confirmationService: ConfirmationService,
        private primengConfig: PrimeNGConfig,
        private translationRequestService: TranslationRequestService,
        private layoutService: DashboardLayoutService,
        private dialogService: DialogService,
        private eventBusMapping: NgEventBus,
        public reportService: ReportService,
        private fb: UntypedFormBuilder,
        private projectTranslationService: ProjectTranslationService,
        private orderReviewService: OrderReviewService,
        private dateService: DateService,
        private projectReportService: ProjectReportService,
        private checklistService: ChecklistService,
        private readonly projectUpdateService: ProjectUpdateService
    ) {}

    ngOnInit(): void {
        this.onLoad();
        this.primengConfig.ripple = true;
        this.projectService.getPropertiesState().subscribe((res) => {
            this.state = res;
            if (this.state.isProjectPropertiesUpdated == 1) {
                this.onLoad();
            }
        });
        this.createNewProjectVersionAfterTranslationImport();
        this.checklistService.getChecklist().subscribe((checklist) => {
            this.checklist = checklist;
        });
        this.eventBusMapping
            .on('translationRequest:totalCount')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (response: MetaData) => {
                    this.IgcDockManagerLayout = this.layoutService.getlayout();
                    this.translationAllData = response.data.translationRequestsForProject;
                },
            });
        this.eventBusMapping
            .on('reviewOrders:totalCount')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.IgcDockManagerLayout = this.layoutService.getlayout();
                },
            });

        this.eventBusMapping
            .on('onProjectPropertiesChanges:editorLanguageChanges')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (response: MetaData) => {
                    this.callFromChildProjectUpdate(response.data);
                },
            });

        this.eventBusMapping
            .on('onProjectCreate:AddRow')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (response: MetaData) => {
                    this.addDefaultProjectRow(response.data);
                },
            });

        this.projectService.closeProjectCreateDialog$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this.closeDialogeOnCancel();
        });
    }
    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
    showStepsDialog() {
        this.router.navigate(['main/dashboard/base-file']);
        this.displayStepDialoge = true;
        this.propertiesOfProject = false;
    }
    showPrepareDialog() {
        this.router.navigate(['main/dashboard/prepare-project']);
        this.displayPrepareDialog = true;
        this.showProjectError = true;
    }
    closePrepareDialog() {
        this.displayPrepareDialog = false;
        this.showProjectError = true;
        this.router.navigate(['main/dashboard']);
    }

    showPropertiesOfProjectDialog(projectDetails) {
        let header = `Properties of ${projectDetails?.title}, Version:${projectDetails?.version_no_sort}`;
        if (projectDetails.isRawProject) {
            header = 'Create Raw Project';
        }
        const projectPropertiesDialogRef = this.dialogService.open(ProjectPropertiesComponent, {
            header: header,
            footer: ' ',
            modal: true,
            closable: false,
            autoZIndex: true,
            width: '70vw',
            minX: 10,
            minY: 10,
            data: projectDetails,
            draggable: true,
            styleClass: 'project-properties',
        });

        projectPropertiesDialogRef.onMaximize.subscribe((value) => {
            this.messageService.add({
                severity: 'info',
                summary: 'Maximized',
                detail: `maximized: ${value.maximized}`,
            });
        });
    }

    getProject(pid, product) {
        this.displayContextMenu(product);
        const projData = this.products.filter((e) => e.project_id == pid);
        this.project_status = projData[0]['status'];
        this.translationRequestService.setProjectManager(projData[0]);
    }

    projectUpdateDialog(pdata) {
        this.localStorageService.set('translationRole', pdata.translation_role);
        if (pdata != undefined) {
            this.id = this.prgressbar[pdata.project_id + 'id'];
            this.project_status = this.prgressbar[pdata.project_id + 'messageType'];
            this.project_title = pdata.title;
        }
        if (this.project_status == 'OK' || pdata?.isUpdated) {
            this.projectUpdateService.setProjectState(pdata);
            pdata?.isUpdated && !pdata?.isRawProject
                ? this.router.navigate([`main/dashboard/update-configuration/${this.id}`])
                : this.router.navigate([`main/dashboard/upload-xml/${this.id}`]);
            this.projectUpdatedDialog = true;
            this.displayStepDialoge = false;
            this.propertiesOfProject = false;
            this.updateProject(this.id, !pdata?.isRawProject);
        } else {
            this.confirmationService.confirm({
                message: 'Project status should be Ok before any mass operation can start',
                icon: 'pi pi-exclamation-triangle',
                key: 'infoDialog',
                accept: () => {
                    this.msgs = [
                        {
                            severity: 'info',
                            summary: 'Confirmed',
                            detail: 'You have accepted',
                        },
                    ];
                },
            });
        }
    }
    clicked() {
        this.display = true;
    }
    onRejectPojectStatus() {
        this.messageService.clear('projectStatus');
    }
    onRowSelect(event) {
        this.existing_Project_Id = event.data.existing_project_id;
    }
    updateProject(pid: number, isDisabled: boolean) {
        this.projectUpdateStepitems = [
            {
                label: 'Upload New XML',
                routerLink: `upload-xml/${pid}`,
                disabled: isDisabled,
            },
            {
                label: 'Configuring the update',
                routerLink: `update-configuration/${pid}`,
            },
            {
                label: 'Confirmation',
                routerLink: `summary-start-execution/${pid}`,
            },
        ];
    }
    onLoad() {
        this.projectProgressDetails = {};
        this.localStorageService.set('pageName', 'Dashboard');
        this.displayStepDialoge = this.projectService.getCloseDialoge();
        this.userInfo = this.userService.getUser();
        this.postUserId = { user_id: this.userInfo.id };
        this.loadingDashboradDetails = true;
        this.IgcDockManagerLayout = this.layoutService.getlayout();
        this.fetchSocket();
        this.projectService
            .getProjectsFromDB('project-list/user')
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                this.loadingDashboradDetails = false;
                if (res?.status == 'OK') {
                    this.state.isProjectPropertiesUpdated = 0;
                    if (res.data[1] !== undefined) {
                        this.editorLanguage =
                            res.data[1]['created_project'].length !== 0
                                ? res.data[1]['created_project'][0]['editor_language_code']
                                : '';
                    }
                    this.products = [];
                    this.products = res.data[0].schedule_project;
                    this.products.push(...res.data[1].created_project);
                    this.products.push(...res.data[2].shared_project);
                    for (const product of this.products) {
                        let n = product['version_no'];
                        n = (n + '').split('.');
                        product['version_no_sort'] = n[1];
                    }
                    this.updateEditorCount();
                    this.editorsProjects = res.data;
                    this.updateStatus();
                }
            });

        this.projectCreationStepitems = this.layoutService.getProjectCreationStepItems();
        this.projectTranslationItems = this.layoutService.getProjectTranslationItems();
        this.newVersionForm = this.fb.group({
            versionname: ['', Validators.required],
        });
    }
    addSingle(pid) {
        const data = this.products?.filter((e) => e.project_id == pid);
        let message = '';
        if (data.length !== 0) {
            message = this.prgressbar[pid + 'messageType'] + ' done successfully';
        } else {
            message = 'Project Creation done successfully';
        }
        const acceptID = {
            project_id: pid,
        };
        this.projectService
            .acceptMassOperation(acceptID)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                if (res?.status === 'OK') {
                    this.messageService.add({
                        severity: 'success',
                        detail: this.capitalizeFirstLetter(message),
                        life: 6000,
                    });
                    this.reportService.isDisabledBtn = true;
                    this.onLoad();
                }
            });
    }
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    onConfirm() {
        this.messageService.clear('delete');
        this.deleteProjectByID();
        this.displayProjectDeatils = false;
        this.onLoad();
    }
    onReject() {
        this.messageService.clear('delete');
    }
    showConfirm(pdata) {
        if (pdata != undefined) {
            this.id = this.prgressbar[pdata.project_id + 'id'];
            this.project_status = this.prgressbar[pdata.project_id + 'messageType'];
            this.project_title = pdata.title;
            this.deleteOnRejectId = this.id;
        }
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the Project?',
            header: 'Delete Version',
            icon: 'pi pi-exclamation-triangle',
            key: 'deleteProject',
            accept: () => {
                this.onAcceptDeleteProject();
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
    setEditProjectTitle(title) {
        this.editSetTitle = 'Properties Of ' + title;
    }
    deleteProjectByID() {
        let url;
        if (this.project_status == 'scheduled') {
            url = `delete-project/delete/schedule/${this.id}`;
        } else {
            url = `delete-project/delete/${this.id}`;
        }

        this.projectService
            .deleteProjectByID(url)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                !!response && this.onLoad();
            });
    }

    deleteProjectOnClickOfReject() {
        let url;
        if (this.project_status == 'scheduled') {
            url = `delete-project/delete/schedule/${this.deleteOnRejectId}`;
        } else {
            url = `delete-project/delete/${this.deleteOnRejectId}`;
        }
        this.projectService
            .deleteProjectOnReject(url)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (response) {
                    this.reportService.isDisabledBtn = true;
                    this.onLoad();
                }
            });
    }
    onConfirmDelete() {
        this.messageService.clear('deleteProject');
        this.deleteProjectOnClickOfReject();
        this.closeProjectDetails();
        this.onLoad();
    }
    onRejectDelete() {
        this.messageService.clear('deleteProject');
    }
    showConfirmDelete(id: any) {
        this.deleteOnRejectId = id;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the project?',
            header: 'Reject Project',
            icon: 'pi pi-exclamation-triangle',
            key: 'rejectProject',
            accept: () => {
                this.deleteProjectOnClickOfReject();
                this.closeProjectDetails();
                this.onLoad();
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
    onRejectAbortOperation() {
        this.messageService.clear('abortOperation');
    }
    abortOperation(pid) {
        this.id = pid;
        this.confirmationService.confirm({
            message: 'Are you sure you want to abort the project? You will lose all the project data',
            header: 'Abort the project',
            icon: 'pi pi-exclamation-triangle',
            key: 'deleteProject',
            accept: () => {
                this.onAcceptDeleteProject();
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
    onConfirmAbortOperation() {
        this.messageService.clear('abortOperation');
        this.projectService
            .abortProjectOnReject('execute-massoperation/stop-mass-operation', {
                project_id: this.isAbortOperationID,
            })
            .subscribe();
    }
    closeProjectDetails() {
        this.displayProjectDeatils = false;
        this.warningData = [];
        this.infoData = [];
        this.errorData = [];
    }
    // View deatils dialog code ended

    updateStatus() {
        for (const element of this.products) {
            const version = JSON.stringify(element['version_no']).split('.');
            if (version[1] == undefined) {
                version[1] = '00';
            }
            this.prgressbar[element['project_id'] + 'id'] = element['project_id'];
            this.prgressbar[element['project_id'] + 'versionshow'] = version[1];
            this.prgressbar[element['project_id'] + 'progress'] = element['progress_status'];
            this.prgressbar[element['project_id'] + 'messageType'] = element['status'];
            this.prgressbar[element['project_id'] + 'version_name'] = element['version_name'];
        }
        if (this.products[0] != undefined && this.products[0].version_no != undefined) {
            this.eventBusMapping.cast('prgressbar:prgressbar', this.prgressbar);
            this.displayView(
                this.products[0].project_id,
                this.products[0].title,
                this.products[0].version_no,
                this.products[0].status,
                'click',
                this.products[0].isRawProject
            );
        } else {
            this.viewDetails = false;
            this.eventBusMapping.cast('showdetails:showdetails', false);
        }
        this.fetchSocket();
    }
    private mapScheduleProject(id: number, title: string, status: string) {
        if (status === 'ProjectScheduleProgress') {
            this.products[this.products?.findIndex((e) => e.title === title)].project_id = id;
        }
    }
    // View Details dialog started--------
    showProjectDetails(pid, title, progress, data, version, status) {
        this.selectedPid = pid;
        this.mapScheduleProject(pid, title, status);
        const projData = this.products.filter((e) => e.project_id == pid);
        const sendDataToProjectDetails = {
            pid: pid,
            title: title,
            version_no: version,
            status: status,
            progress: progress,
            data: data,
            projData: projData,
            editorLanguage: this.editorLanguage,
        };
        this.eventBusMapping.cast('showDetails:showDetails', sendDataToProjectDetails);
    }
    setProgress(projectId, title, versionInDecimal) {
        for (let i = 0; i < this.products.length; i++) {
            if (
                (this.products[i]['title'] == title && this.products[i]['version_no'] == '00') ||
                this.products[i]['version_no'] == '1'
            ) {
                if (this.products[i]['project_id'] === null) {
                    this.products[i] = this.layoutService.setRowProgress(
                        this.products[i],
                        projectId,
                        title,
                        versionInDecimal
                    );
                }
                if (typeof this.products[i].version_no === 'string') {
                    const version = this.products[i]['version_no'].split('.');
                    this.prgressbar[projectId + 'versionshow'] = version[1];
                }
            }
        }
    }
    //Web Socket
    async fetchSocket() {
        const socket = io(this.urlWebSocket, { transports: ['websocket'] });
        socket.on('connect', () => {
            socket.on('hmldata', (data) => {
                if (data.Length != 0) {
                    const versionInDecimal = data[0].version_no;
                    this.setProgress(data[0].projectid, data[0].title, versionInDecimal);
                    if (this.prgressbar[data[0].projectid + 'progress'] == undefined) {
                        this.prgressbar[data[0].projectid + 'progress'] = 0;
                        this.prgressbar[data[0].projectid + 'previousProgress'] = 0;
                    }
                    this.prgressbar[data[0].projectid + 'id'] = data[0].projectid;
                    this.prgressbar[data[0].projectid + 'progress'] = data[0].progress;
                    this.prgressbar[data[0].projectid + 'messageType'] = data[0].messageType;
                    if (data[0].version_name != undefined) {
                        this.prgressbar[data[0].projectid + 'version_name'] = data[0].version_name;
                    }
                    if (
                        this.prgressbar[data[0].projectid + 'progress'] !=
                        this.prgressbar[data[0].projectid + 'previousProgress']
                    ) {
                        this.previousProgress = data[0].progress;
                        this.prgressbar[data[0].projectid + 'previousProgress'] = data[0].progress;
                        this.prgressbar[data[0].projectid] = data[0];
                        this.prgressbar[data[0].projectid + 'report'] = data[0].report;
                        this.eventBusMapping.cast('prgressbar:prgressbar', this.prgressbar);
                    }
                    if (data[0].progress === 5) {
                        this.displayView(data[0].projectid, data[0].title, versionInDecimal, data[0].messageType, '');
                        if (this.selectedPid === data[0].projectid) {
                            this.IgcDockManagerLayout = this.layoutService.getlayout();
                        }
                    }
                    if (this.prgressbar[data[0].projectid + 'progress'] === 100) {
                        if (
                            this.prgressbar[data[0].projectid + 'messageType'] == 'ProjectScheduleProgress' ||
                            this.prgressbar[data[0].projectid + 'messageType'] == 'MappingAssistentProgress'
                        ) {
                            this.displayView(
                                data[0].projectid,
                                data[0].title,
                                versionInDecimal,
                                data[0].messageType,
                                ''
                            );
                        }
                        this.prgressbar[data[0].projectid + 'messageType'] = this.getMessageType(
                            this.prgressbar[data[0].projectid + 'messageType']
                        );

                        this.updateEditorCount();
                    }
                }
            });
        });
    }

    private getMessageType(message: string) {
        const map = {
            ProjectUpdateProgress: 'Project Update',
            MappingAssistentProgress: 'Mapping Assistent',
            TranslationImportProgress: 'Translation Import',
        };
        return map[message] ?? 'Project Creation';
    }

    callFromChildEditProperties() {
        this.propertiesOfProject = false;
    }
    callFromChildPropertiesofProject(dataPropertiesofProject, statusData) {
        let duplicateDefault = 'Default';
        if (statusData == 'Duplicateproject') {
            duplicateDefault = dataPropertiesofProject?.version_name;
        }
        let version = '00';
        if (statusData == 'SCHEDULE') {
            version = '1';
        }
        const dataPush = this.layoutService.setRowChildProject(dataPropertiesofProject, version, duplicateDefault);
        if (this.products != null) {
            this.products.splice(0, 0, dataPush);
        } else {
            this.products = [];
            this.products.push(dataPush);
        }

        this.displayStepDialoge = false;
        this.projectUpdatedDialog = false;
        this.router.navigate(['main/dashboard']);
    }
    callFromChildProjectUpdate(data) {
        const dataPush = this.layoutService.setRowChildProjectUpdate(data);
        if (this.products != null) {
            this.products.splice(0, 0, dataPush);
        } else {
            this.products = [];
            this.products.push(dataPush);
        }
        this.projectUpdatedDialog = false;
    }
    cancelStepDialoge() {
        this.displayStepDialoge = false;
    }
    closeDialogeOnCancel() {
        this.displayStepDialoge = false;
        this.projectUpdatedDialog = false;
    }
    closeProjrctUpdateDialoge() {
        this.projectUpdatedDialog = false;
    }
    navigateTranslate(pdata) {
        let selectedVersion;
        let title;
        if (pdata) {
            const projectData = { ...pdata, fontPath: pdata?.font_path };
            this.projectTranslationService.setCalculateLengthApiPayload(projectData);
            this.id = this.prgressbar[pdata.title + pdata.version_no + 'id'];
            this.project_status = this.prgressbar[pdata.title + pdata.version_no + 'messageType'];
            this.project_title = pdata.title;
            selectedVersion = pdata.version_no;
            title = pdata.title;

            const data = {
                projectId: pdata?.project_id,
                version: pdata?.version_no,
                editorLanguageCode: pdata?.editor_language_code,
                editorLanguageId: pdata?.editor_language,
                projectName: pdata?.title,
                role: this.userInfo?.role,
                userID: pdata?.user_id,
                textNodeCount: pdata?.text_node_counts,
                brandId: pdata?.brand_id,
                projectManagerEmail: pdata?.project_manager_email,
                projectManagerId: pdata?.project_manager_id,
                translationRequestId: this.translationRequestId ? this.translationRequestId : null,
                userProps: this?.userService?.getUser(),
                placeholder: pdata?.placeholder,
                gpConfigIds: pdata?.gpConfigIds ?? [],
            };
            localStorage.setItem('projectProps', JSON.stringify(data));
        } else {
            selectedVersion = this.project_version;
        }
        const navigationExtras: NavigationExtras = {
            state: {
                id: this.id,
                version: selectedVersion,
                title: title,
                languageCode: pdata.editor_language_code,
                translation_request_id: '',
                role: 'editor',
            },
        };
        this.router.navigate(['/main/project-translation'], navigationExtras);
    }

    displayConfiguration(id) {
        this.router.navigate(['main/dashboard/igxpanel'], { state: { pid: id } });
    }
    displayView(pid, title, version_no, status, isEvent, isRawProject?: boolean) {
        this.isRawProject = isRawProject;
        this.isDCProject = status === ProjectStatusEnum.Prepared || status === ProjectStatusEnum.UpdateAvailable;
        this.isDCProjectStatusWiseMessage =
            status === ProjectStatusEnum.Prepared
                ? 'The raw project from the data creator is available for project creation.'
                : ' The updated raw project from the data creator is available for project update.';
        if (isEvent == 'click' || status === 'MappingAssistentProgress') {
            const data = {
                pid: pid,
                version_no: +version_no,
            };
            this.eventBusMapping.cast('showDetailsHistory:showDetailsHistory', data);
        }
        this.showProjectDetails(
            pid,
            title,
            this.prgressbar[pid + 'progress'],
            this.prgressbar[pid + 'data'],
            version_no,
            status
        );
        this.displayContextMenu(status);
    }
    //Duplicating the project
    showDuplicateProject(projectData, title) {
        const data = {
            projectName: projectData.title,
            date: projectData.due_date,
            version_name: title.versionname,
            version: (Number(projectData.version_no) + 0.01).toFixed(2).split('.')[1],
        };
        this.callFromChildPropertiesofProject(data, 'Duplicateproject');
        const duplicatePostProject = {
            project_id: projectData.project_id,
            user_id: this.userInfo.id,
            version_name: title.versionname,
        };
        this.projectService
            .duplicateProject(duplicatePostProject)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.onLoad();
                }
            });
    }
    newVersion(projectData) {
        const title =
            'Duplicate (' + projectData.title + ':' + Number(projectData.version_no).toFixed(2).split('.')[1] + ')';
        this.showNewVersion = true;
        this.newVersionForm.patchValue({
            versionname: title,
        });
    }
    submitNewVersion(title) {
        this.showNewVersion = false;
        this.showDuplicateProject(this.selectedProduct, title);
    }
    translationRequestCheckSameProject() {
        const sameProject = this.translationRequestService.isTranslationRequestAvailableSameProject(
            this.translationAllData,
            this.selectedPid
        );
        if (sameProject?.includes(true)) {
            this.confirmationService.confirm({
                message:
                    'Translation request is already open for this project. New translation request can be raised only after existing translation request is completed.',
                icon: 'pi pi-exclamation-triangle',
                key: 'infoDialog',
                accept: () => {
                    this.msgs = [
                        {
                            severity: 'warn',
                            summary: 'Confirmed',
                            detail: 'You have accepted',
                        },
                    ];
                },
            });
        } else {
            this.showTranslationRequest();
        }
    }
    public onMaximize() {
        this.isPopupMaximized = !this.isPopupMaximized;
    }
    sendKey(num) {
        return StatusKey[num];
    }
    selectProjectTR(data) {
        this.translationRequestId = data?.id;
        this.selectedProject = data;
    }
    showExport() {
        this.eventBusMapping.cast('eventExcution:afterExportSelect', this.selectedProduct);
        this.exportProjectName = 'Export for project ' + this.projectTitle;
        this.export = !this.export;
    }
    hideExport() {
        this.export = !this.export;
    }
    mappingAssistent(projectData) {
        this.viewSetting = !this.viewSetting;
        const data = {
            projectName: projectData.title,
            date: projectData.due_date,
            version: (Number(projectData.version_no) + 0.01).toFixed(2).split('.')[1],
            finalDelivery: projectData.due_date,
            status: 'Mapping Assistent',
        };
        this.callFromChildPropertiesofProject(data, 'MappingAssistent');
    }
    hideSetting() {
        this.viewSetting = !this.viewSetting;
    }
    checkDate(date: any) {
        return date(date);
    }
    isCheckDate(varDate) {
        const dueDate = new Date(varDate);
        return dueDate.getTime() <= this.currentDate.getTime();
    }
    isCheckNullDate(date) {
        let checkDate = date;
        if (checkDate !== '') {
            checkDate = new Date(date).toString();
            return !checkDate.includes('Mon Jan 01 1900');
        } else {
            return false;
        }
    }

    displayContextMenu(product) {
        if (product?.status === ProjectStatusEnum.OK) {
            this.contextMenuItems = [
                {
                    label: 'Translate',
                    command: () => {
                        this.navigateTranslate(this.selectedProduct);
                    },
                },
                {
                    separator: true,
                },
                {
                    label: 'Properties',
                    command: () => {
                        this.showPropertiesOfProjectDialog(this.selectedProduct);
                    },
                },
                {
                    separator: true,
                },
                {
                    label: 'Update',
                    command: () => {
                        this.projectUpdateDialog(this.selectedProduct);
                    },
                    disabled: !product.isUpdated && product.rawProjectId !== null,
                },
                {
                    label: 'Order Review',
                    command: () => {
                        this.showOrderReview();
                    },
                },
                {
                    label: 'Order Translations',
                    command: () => {
                        this.translationRequestCheckSameProject();
                    },
                },
                {
                    label: 'Delete Version',
                    command: () => {
                        this.showConfirm(this.selectedProduct);
                    },
                },
                {
                    separator: true,
                },

                {
                    label: 'Export',
                    command: () => {
                        this.showExport();
                    },
                },
                {
                    label: 'Label Manager',
                    command: () => {
                        this.openLabelManager();
                    },
                },
                {
                    separator: true,
                },
                {
                    label: 'Mapping Assistant',
                    command: () => {
                        this.mappingAssistent(this.selectedProduct);
                    },
                },

                {
                    label: 'New Version',
                    command: () => {
                        this.newVersion(this.selectedProduct);
                    },
                },
                {
                    label: 'Report',
                    command: () => {
                        this.projectReportService.showProjectReport(this.selectedProduct);
                    },
                },
                {
                    separator: true,
                },
                {
                    label: 'Remove Comments',
                    command: () => {
                        this.deleteComments(this.selectedProduct);
                    },
                },
            ];
        } else {
            this.contextMenuItems = [
                {
                    label: 'Translate',
                    command: () => {
                        this.navigateTranslate(this.selectedProduct);
                    },
                    disabled: true,
                },
                {
                    separator: true,
                },
                {
                    label: 'Properties',
                    command: () => {
                        this.showPropertiesOfProjectDialog(this.selectedProduct);
                    },
                    disabled: true,
                },
                {
                    separator: true,
                },
                {
                    label: 'Update',
                    command: () => {
                        this.projectUpdateDialog(this.selectedProduct);
                    },
                    disabled: product?.isRawProject,
                },
                {
                    label: 'Order Review',
                    command: () => {
                        this.showOrderReview();
                    },
                    disabled: true,
                },
                {
                    label: 'Order Translations',
                    command: () => {
                        this.translationRequestCheckSameProject();
                    },
                    disabled: true,
                },
                {
                    label: 'Delete Version',
                    command: () => {
                        this.showConfirm(this.selectedProduct);
                    },
                },
                {
                    separator: true,
                },
                {
                    label: 'Export',
                    command: () => {
                        this.showExport();
                    },
                    disabled: true,
                },
                {
                    separator: true,
                },
                {
                    label: 'Mapping Assistant',
                    command: () => {
                        this.mappingAssistent(this.selectedProduct);
                    },
                    disabled: true,
                },
                {
                    label: 'New Version',
                    disabled: true,
                },
                {
                    separator: true,
                },
                {
                    label: 'Remove Comments',
                    disabled: true,
                },
                {
                    label: 'Create Raw Project',
                    visible: product.isRawProject,
                    command: () => {
                        this.showPropertiesOfProjectDialog(product);
                    },
                },
            ];
        }
    }

    private createNewProjectVersionAfterTranslationImport() {
        this.eventBusMapping
            .on('dashboard:data')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res: MetaData) => {
                    this.callFromChildPropertiesofProject(res.data, 'TranslationImport');
                },
            });
    }

    private onAcceptDeleteProject() {
        this.deleteProjectByID();
        this.closeProjectDetails();
        this.onLoad();
    }

    private showTranslationRequest() {
        const translationRequestDialogRef = this.dialogService.open(
            TranslationRequestComponent,
            this.getDefaultDialogConfig('Translation Request')
        );
        translationRequestDialogRef.onClose.subscribe((response) => {
            this.translationRequestService.resetTranslationRequestState();
            this.handleResponseOnDialogClose(response, 'Translation Request');
        });
    }
    private showOrderReview() {
        this.setOrderReviewState();

        const orderReviewDialogRef = this.dialogService.open(
            OrderReviewComponent,
            this.getDefaultDialogConfig('Order Review')
        );

        orderReviewDialogRef.onClose.subscribe((response) => {
            this.orderReviewService.setOrderReviewState(null);
            this.handleResponseOnDialogClose(response, 'Order Review');
        });
    }

    private setOrderReviewState() {
        const orderReviewState: OrderReviewStateModel = {
            projectId: this.selectedProduct.project_id,
            versionId: this.selectedProduct.version_no,
            dueDate: this.dateService.getValidDate(this.selectedProduct.due_date),
            sourceLanguages: this.getSourceLanguages(),
            editorLanguage: this.getEditorLanguage(),
            supplierLanguage: this.getSupplierLanguage(),
            selectedFiles: [],
        };
        this.orderReviewService.setOrderReviewState(orderReviewState);
    }

    private getSupplierLanguage() {
        return {
            languageCode: 'Dev-Text',
            languageId: 0,
        };
    }

    private getSourceLanguages() {
        if (!this.selectedProduct?.['language_prop']) {
            return [];
        }

        return this.selectedProduct['language_prop'].map((item) => ({
            languageCode: item.xml_language,
            languageId: item.language_id,
            reviewer: '',
        }));
    }

    private getEditorLanguage() {
        return {
            languageCode: this.selectedProduct?.['editor_language_code'],
            languageId: this.selectedProduct?.['editor_language'],
        };
    }

    private getDefaultDialogConfig(header: string, projectData?) {
        return {
            header,
            footer: ' ',
            modal: true,
            closable: true,
            autoZIndex: true,
            width: '70vw',
            minX: 10,
            minY: 10,
            data: projectData,
            draggable: true,
        };
    }

    private handleResponseOnDialogClose(response, title: string) {
        const successDetail = `${title} created successfully`;
        const errorDetail = `Failed to create ${title}`;
        if (response) {
            this.messageService.add({
                severity: 'success',
                summary: title,
                detail: this.titleCaseWord(successDetail),
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: title,
                detail: this.titleCaseWord(errorDetail),
            });
        }
    }

    private titleCaseWord(word: string) {
        if (!word) return word;
        return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }

    deleteComments(projectData) {
        this.dialogService.open(
            DeleteCommentsComponent,
            this.getDefaultDialogConfig('Clean Up Project Comments', projectData)
        );
    }

    uploadDocuments(count: number) {
        this.documentCount = count;
    }

    private openLabelManager(): void {
        this.dialogService.open(LabelManagerComponent, {
            header: `Label Management - ${this.selectedProduct?.title}`,
            width: '70%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            data: {
                selectedProject: this.selectedProduct,
            },
        });
    }

    private updateEditorCount() {
        this.layoutService.changeEditorCount(this.products?.length ?? 0);
        this.IgcDockManagerLayout = this.layoutService.getlayout();
    }

    getStatus(): string {
        return '';
    }

    addDefaultProjectRow(defaultRow) {
        if (this.products != null) {
            this.products.splice(0, 0, defaultRow);
        } else {
            this.products = [];
            this.products.push(defaultRow);
        }
    }

    isOtherThanRawProject(status) {
        return (
            status !== ProjectStatusEnum.OK &&
            status !== ProjectStatusEnum.Prepared &&
            status !== ProjectStatusEnum.UpdateAvailable
        );
    }
}
