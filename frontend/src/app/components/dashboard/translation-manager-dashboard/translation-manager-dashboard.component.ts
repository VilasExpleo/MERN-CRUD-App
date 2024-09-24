import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, MenuItem, PrimeNGConfig } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Splitter } from 'primeng/splitter';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import {
    BrandLogo,
    Roles,
    ResponseStatusEnum,
    StatusKey,
    TranslationRequestsStatusEnum,
    TranslationRequestsStatusIconEnum,
} from 'src/Enumerations';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { RejectOrderService } from 'src/app/core/services/reject-order/reject-order.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { SanityChecksService } from 'src/app/core/services/sanity-checks/sanity-checks.service';
import { TranslationManagerService } from 'src/app/core/services/translation-manager-service/translation-manager.service';
import { ChecklistService } from 'src/app/core/services/translation-request/checklist.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { OverlayPanelComponent } from 'src/app/shared/components/overlay-panel/overlay-panel.component';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { Brand } from 'src/app/shared/models/brand';
import { ManagerSanityCheckModel } from 'src/app/shared/models/sanity-check.model';
import { LanguageCount, TranslationManager } from 'src/app/shared/models/tmdata';
import { ReassignWorkerComponent } from './reassign-translator/reassign-translator.component';
import { ReassignProofreaderComponent } from './reassign-proofreader/reassign-proofreader.component';
@Component({
    selector: 'app-translation-manager-dashboard',
    templateUrl: './translation-manager-dashboard.component.html',
    styleUrls: ['./translation-manager-dashboard.component.scss'],
})
export class TranslationManagerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    contextMenuItems: MenuItem[] = [];
    childContextMenuItems: MenuItem[] = [];
    projects: TranslationManager[] = [];
    tmlangcount: LanguageCount[] = [];
    display = false;
    selectProjectId: number = null;
    userInfo;
    tmUserId;
    projectTitle;
    loadingViewDetails = false;
    documents = [{ title: 'Editer' }, { title: 'Project Manager' }];
    loadingDashboradDetails = false;
    showS = false;
    @ViewChild('pSplitter') pSplitter: Splitter;
    widthHelper = '100%';
    @Output() progressPercentage: EventEmitter<number> = new EventEmitter<number>();
    displayFinishTRDialog = false;
    contentHeight = '500px';
    viewHeight = '500px';
    viewPageLine = 10;
    @ViewChild('content') elementView: ElementRef;
    items;
    displayAssignWorker = false;
    noLanguageAssignDialog = false;
    selectedProject: TranslationManager;
    editorDocs = [];
    projManagerDocs = [];
    transManagerDocs = [];
    showDateBellIcon = {};
    dateDifference;
    due_date = new Date();
    currentDate = new Date();
    brand: string;
    statisticalEvaluation = false;
    IgcDockManagerLayout: object = {};
    statuses = [];
    checklist: ChecklistModel[];
    destroyed$ = new Subject<boolean>();
    translationRequestsStatusEnum = TranslationRequestsStatusEnum;
    translationRequestsStatusIconEnum = TranslationRequestsStatusIconEnum;
    roles = Roles;
    assignWorkerReference: DynamicDialogRef;
    selectedChildProject;
    role = 'Translator';
    workerComment;
    isRejectedByWorker: boolean;
    constructor(
        private readonly eventBus: NgEventBus,
        private readonly translationReqService: TranslationRequestService,
        private readonly userService: UserService,
        private readonly primengConfig: PrimeNGConfig,
        private readonly translationManagerService: TranslationManagerService,
        private readonly layoutService: DashboardLayoutService,
        private readonly projectTranslationService: ProjectTranslationService,
        private readonly projectReportService: ProjectReportService,
        private readonly sanityChecksService: SanityChecksService,
        private readonly checklistService: ChecklistService,
        private readonly dialogService: DialogService,
        private readonly rejectOrderService: RejectOrderService,
        private readonly confirmationService: ConfirmationService
    ) {}

    onLoad() {
        this.userInfo = this.userService.getUser();
        this.IgcDockManagerLayout = this.layoutService.getlayoutTM();
        this.tmUserId = { user_id: this.userInfo.id };
        this.loadingDashboradDetails = true;
        this.initializeData();

        this.contextMenuItems = [
            {
                label: 'Assign Workers',
                command: () => {
                    this.assignWorkerDialog(this.selectedProject);
                },
                disabled: false,
            },
            {
                label: 'Complete Order',
                command: () => {
                    this.showFinishTRDialog(this.selectedProject);
                },
                disabled: false,
            },
            {
                label: 'Statistical Evaluation',
                command: () => {
                    this.showStatisticalEvaluation();
                },
            },
            {
                label: 'Report',
                command: () => {
                    this.projectReportService.showProjectReport(this.selectedProject);
                },
            },
            {
                label: 'Reject Order',
                command: () => {
                    this.openRejectOrderDialog();
                },
            },
        ];

        for (let i = 1; i <= Object.keys(StatusKey).length / 2; i++) {
            const obj = { label: StatusKey[i], value: i };
            this.statuses.push(obj);
        }

        this.eventBus
            .on('translationRequest:totalCount')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.IgcDockManagerLayout = this.layoutService.getlayoutTM();
                },
            });
    }

    ngOnInit(): void {
        this.onLoad();
        this.checklistService.getChecklist().subscribe((checklist) => {
            this.checklist = checklist;
        });
        this.primengConfig.ripple = true;

        this.eventBus.on('rejectOrder:rejectResponse').subscribe((response) => {
            if (response) {
                this.projects = this.projects.filter((item) => item.project_id !== this.selectedProject.project_id);
            }
        });
    }

    displayView(project) {
        this.selectProjectId = project.project_id;
        this.selectedProject = project;
    }

    recalculateSlider() {
        this.widthHelper =
            0.01 *
                this.pSplitter._panelSizes[0] /*percent of the panel width*/ *
                600 *
                /*width of the panel component*/ -4 /*width of the splitter*/ +
            'px';
    }

    assignWorkerDialog(selectedProject: TranslationManager) {
        if (this.selectedProject['language_prop'].length > 0) {
            this.translationManagerService.openAssignWorkerDialog(selectedProject);
        } else {
            this.noLanguageAssignDialog = true;
        }
    }

    closeNoLanguageAssignDialog() {
        this.noLanguageAssignDialog = false;
    }

    updateDataOnDashboard($event) {
        if ($event) {
            this.initializeData();
        }
    }

    initializeData() {
        this.translationReqService
            .getManager('translation-manager-dashboard/getData', this.tmUserId)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                this.loadingDashboradDetails = false;
                if (res?.status === 'OK') {
                    this.projects = res.data;
                    this.selectedProject = res.data[0];
                    this.layoutService.changeTmCount(this.projects?.length);
                    this.IgcDockManagerLayout = this.layoutService.getlayoutTM();
                    this.projects.forEach((project: any, i) => {
                        this.projects[i].brand = this.projects[i].brand.trim();
                        const dueDate = new Date(project.pm_due_data);
                        const same = dueDate.getTime() - this.currentDate.getTime();
                        this.dateDifference = Math.ceil(same / (1000 * 60 * 60 * 24));
                        this.showDateBellIcon[project.project_title + 'bell'] = this.dateDifference;
                        const versionShow = this.projects[i].version_id;
                        const versionId = versionShow.toString().split('.')[1];
                        this.projects[i].version_id_show = versionId;
                    });
                    this.displayView(this.selectedProject);
                }
                this.layoutService.setTranslationRequestCount(0);
            });
    }

    showFinishTRDialog(data) {
        const payload = {
            project_id: data.project_id,
            version_id: data.version_id,
            translation_manager_id: this.tmUserId.user_id,
            translation_request_id: data.translation_request_id,
        };
        this.translationReqService
            .getManager('translation-manager-dashboard/getTranslatedLangCount', payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                if (res?.status === 'OK') {
                    this.tmlangcount = res.data[0];
                }
            });
        this.displayFinishTRDialog = true;
    }

    completeOrder(data) {
        const payload = {
            project_id: data.project_id,
            version_id: data.version_id,
            translation_manager_id: this.tmUserId.user_id,
            translation_request_id: data.translation_request_id,
        };
        this.translationReqService
            .completeProjectManagerOrder('translation-manager-dashboard/completeOrder', payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                if (res?.status === 'OK') {
                    const datas = this.projects.findIndex((e) => e.project_id == data.project_id);
                    this.projects[datas].status = 5;
                    this.contextMenuItems = this.projectTranslationService.afterFinishTranslationMenuHideShow(
                        this.contextMenuItems,
                        this.sendKey(5),
                        ['Finish Order', 'Assign Workers', 'Reject Order']
                    );
                    this.closeFinishTRDialog();
                } else {
                    this.closeFinishTRDialog();
                }
            });
    }

    closeFinishTRDialog() {
        this.displayFinishTRDialog = false;
    }

    setPageHeight() {
        const height = this.elementView.nativeElement.offsetHeight - 150;
        const dh = this.elementView.nativeElement.offsetHeight - 32;
        this.contentHeight = `${height}px`;
        this.viewHeight = `${dh}px`;
        this.viewPageLine = height / 50;
    }

    sendKey(num) {
        return StatusKey[num];
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.setPageHeight();
        }, 0);
    }

    get brandLogo() {
        return BrandLogo;
    }

    sendLogo(name) {
        return this.brandLogo[name];
    }

    showStatisticalEvaluation() {
        this.statisticalEvaluation = true;
    }

    hidesStatisticalEvaluation() {
        this.statisticalEvaluation = false;
    }

    returnedTranslations(data) {
        const trCount = data.filter((e) => e.return_date !== '').length;
        return `${trCount}/${data.length}`;
    }

    getBrandsName() {
        return Brand.getAllBrands().map((e) => e.getName());
        // Refactored: return Object.values(BrandsName);
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
    }

    openContextMenu(project) {
        let disabledContextMenu: string[] = [];
        switch (this.sendKey(project.status)) {
            case 'Translated':
                disabledContextMenu = ['Assign Workers', 'Complete Order', 'Reject Order'];
                break;
            case 'Assigned':
                disabledContextMenu = ['Assign Workers', 'Reject Order'];
                break;
            case 'In Translation':
                disabledContextMenu = ['Assign Workers', 'Reject Order'];
                break;
        }
        this.contextMenuItems = this.projectTranslationService.afterFinishTranslationMenuHideShow(
            this.contextMenuItems,
            this.sendKey(project.status),
            disabledContextMenu
        );
    }

    getBrandLogo(num) {
        return Brand.getBrand(num).getLogo();
        // Refactored: return BrandLogoEnum[num];
    }

    getAltText(num) {
        return Brand.getBrand(num).getName();
        // Refactored: return BrandEnum[num];
    }

    getSanityMessage(translationLanguageDetails): string {
        const translationManagerSanityCheckModel: ManagerSanityCheckModel = {
            totalCount: translationLanguageDetails?.total_count,
            completedCount: translationLanguageDetails?.completed_count,
        };
        return this.sanityChecksService.getSanityMessage({
            projectManager: translationManagerSanityCheckModel,
            dueDate: this.selectedProject?.pm_due_data,
        });
    }

    uploadDocuments(count: number) {
        this.selectedProject.documentCount = count;
    }

    private openRejectOrderDialog(): void {
        const commentDialogRef: DynamicDialogRef = this.dialogService.open(
            OverlayPanelComponent,
            this.getDialogDefaultConfig()
        );
        commentDialogRef.onClose.subscribe((comment) => {
            if (comment) {
                this.rejectOrderService.rejectOrder(this.selectedProject, comment, this.userInfo);
            }
        });
    }

    private getDialogDefaultConfig(): DynamicDialogConfig {
        return {
            footer: ' ',
            modal: true,
            closable: false,
            autoZIndex: true,
            maximizable: false,
            width: '35vw',
            minX: 10,
            minY: 10,
            draggable: true,
            data: { dialogHeading: 'Comment', isRejectedByTranslationManager: true },
        };
    }

    getSelectedChildRow(row) {
        this.selectedChildProject = row;
        this.childContextMenuItems = this.getChildContextMenuItems(row);
        if (
            row?.status !== TranslationRequestsStatusEnum.Rejected ||
            row?.proofreader_status !== TranslationRequestsStatusEnum.Rejected
        ) {
            this.isRejectedByWorker = true;
        }
        if (
            row?.status === TranslationRequestsStatusEnum.Rejected ||
            row?.proofreader_status === TranslationRequestsStatusEnum.Rejected
        ) {
            this.isRejectedByWorker = false;
        }

        if (this.selectedChildProject?.reason !== null) {
            this.role = 'Translator';
            this.workerComment = this.selectedChildProject?.reason;
        }
        if (this.selectedChildProject?.proofreader_reason !== null) {
            this.role = 'Proofreader';
            this.workerComment = this.selectedChildProject?.proofreader_reason;
        }
    }

    private getChildContextMenuItems(row) {
        let isTranslatorContextMenuDisabled = false;
        let isProofreadContextMenuDisabled = false;
        if (!row?.status) {
            isTranslatorContextMenuDisabled = true;
        }
        if (row?.proofreader_status !== TranslationRequestsStatusEnum.Rejected) {
            isProofreadContextMenuDisabled = true;
        }
        return [
            {
                label: 'Reassign Translator',
                command: () => {
                    this.showConfirmDialog();
                },
                disabled: isTranslatorContextMenuDisabled,
            },
            {
                label: 'Reassign Proofreader',
                command: () => {
                    this.showProofreadConfirmDialog();
                },
                disabled: isProofreadContextMenuDisabled,
            },
        ];
    }

    showConfirmDialog() {
        this.confirmationService.confirm({
            header: `Confirmation - Reassign`,
            message: `Translation of this language will carry forward to the new translator. Are you sure you want to reassign?`,
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            rejectButtonStyleClass: 'p-button-text',
            acceptButtonStyleClass: 'mt-3',
            closeOnEscape: false,

            accept: () => {
                this.openReassignWorkerDialog(this.selectedChildProject);
            },
        });
    }
    openReassignWorkerDialog(row): void {
        this.assignWorkerReference = this.dialogService.open(ReassignWorkerComponent, {
            header: `Assign Translator`,
            footer: ' ',
            modal: true,
            autoZIndex: true,
            maximizable: false,
            width: '35rem',
            draggable: true,
            data: { childRow: this.selectedChildProject, selectedProject: this.selectedProject },
        });
        this.assignWorkerReference.onClose.subscribe((data) => {
            if (data?.response?.status === ResponseStatusEnum.OK) {
                row.status = TranslationRequestsStatusEnum.New;
                row.translator_email = data?.user?.email;
            }
        });
    }

    getTranslatorComments() {
        this.role = 'Translator';
        this.workerComment = this.selectedChildProject?.reason;
    }

    getProofreadComments() {
        this.role = 'Proofreader';
        this.workerComment = this.selectedChildProject?.proofreader_reason;
    }

    getOrderStatus(order): string {
        if (
            order?.status === TranslationRequestsStatusEnum.Rejected ||
            order?.proofreader_status === TranslationRequestsStatusEnum.Rejected
        ) {
            return 'Rejected';
        } else {
            return TranslationRequestsStatusEnum[order.status];
        }
    }

    getStatusIcons(order): string {
        if (
            order?.status === TranslationRequestsStatusEnum.Rejected ||
            order?.proofreader_status === TranslationRequestsStatusEnum.Rejected
        ) {
            return 'pi pi-times-circle';
        } else {
            return TranslationRequestsStatusIconEnum[order.status];
        }
    }

    showProofreadConfirmDialog() {
        this.confirmationService.confirm({
            header: `Confirmation - Reassign`,
            message: `Translation of this language will carry forward to the new proofreader. Are you sure you want to reassign?`,
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            rejectButtonStyleClass: 'p-button-text',
            acceptButtonStyleClass: 'mt-3',
            closeOnEscape: false,

            accept: () => {
                this.openReassignProofreaderDialog(this.selectedChildProject);
            },
        });
    }

    openReassignProofreaderDialog(row): void {
        this.assignWorkerReference = this.dialogService.open(ReassignProofreaderComponent, {
            header: `Assign Proofreader`,
            footer: ' ',
            modal: true,
            autoZIndex: true,
            maximizable: false,
            width: '35rem',
            draggable: true,
            data: { childRow: this.selectedChildProject, selectedProject: this.selectedProject },
        });
        this.assignWorkerReference.onClose.subscribe((data) => {
            if (data?.response?.status === ResponseStatusEnum.OK) {
                row.proofreader_status = TranslationRequestsStatusEnum.New;
                row.proofreader_email = data?.user?.email;
            }
        });
    }
}
