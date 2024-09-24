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
import { NavigationExtras, Router } from '@angular/router';
import { NgEventBus } from 'ng-event-bus';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Splitter } from 'primeng/splitter';
import { Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { OrderStatus, StatusKey } from 'src/Enumerations';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { RejectOrderService } from 'src/app/core/services/reject-order/reject-order.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ChecklistService } from 'src/app/core/services/translation-request/checklist.service';
import { IUserModel } from 'src/app/core/services/user/user.model';
import { OverlayPanelComponent } from 'src/app/shared/components/overlay-panel/overlay-panel.component';
import { CheckListUpdateRequestModel } from 'src/app/shared/models/TranslationRequest/checklist-update-request.model';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { Brand } from 'src/app/shared/models/brand';
import { TranslatorGetData } from '../../../shared/models/tmdata';
import { SanityChecksService } from './../../../core/services/sanity-checks/sanity-checks.service';
import { TranslationRequestService } from './../../../core/services/translation-request/translation-request.service';
import { UserService } from './../../../core/services/user/user.service';
import { TranslatorSanityCheckModel } from './../../../shared/models/sanity-check.model';
import TranslatorDashboardModel from './translator-dashboard.model';
@Component({
    selector: 'app-translator-dashboard',
    templateUrl: './translator-dashboard.component.html',
    styleUrls: ['./translator-dashboard.component.scss'],
})
export class TranslatorDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    contextMenuItems: MenuItem[] = [];
    projects: TranslatorGetData[] = [];
    display = false;
    existing_Project_Id;
    selectProjectId: number = null;
    userInfo: IUserModel;
    translatorUserId;
    projectTitle;
    selectedProject: TranslatorGetData;
    loadingDashboardDetails = false;
    @ViewChild('pSplitter') pSplitter: Splitter;
    widthHelper = '100%';
    @Output() progressPercentage: EventEmitter<number> = new EventEmitter<number>();
    displayFinishTRDialog = false;
    projManagerDocs = [];
    editorDocs = [];
    statuses = [];
    activityValues: number[] = [0, 100];
    contentHeight = '600px';
    viewHeight = '500px';
    viewPageLine = 10;
    @ViewChild('content') elementView: ElementRef;
    items;
    IgcDockManagerLayout: object = {};
    destroyed$ = new Subject<boolean>();
    todayDate: boolean;
    checklist;
    previousChecklist;
    isOpenTask = false;

    sanityMessageModel = {
        proofreadText: 'Proofreading:',
        dateText: 'Due Date:',
        sourceLanguageText: 'Source Language:',
        textNodesText: 'Text Nodes:',
    };

    constructor(
        private readonly translationReqService: TranslationRequestService,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly layoutService: DashboardLayoutService,
        private readonly eventBus: NgEventBus,
        private readonly projectTranslationService: ProjectTranslationService,
        private readonly sanityChecksService: SanityChecksService,
        private readonly projectReportService: ProjectReportService,
        private readonly checklistService: ChecklistService,
        private readonly dialogService: DialogService,
        private readonly rejectOrderService: RejectOrderService
    ) {}

    ngOnInit(): void {
        this.onLoad();
    }
    ngOnDestroy(): void {
        this.destroyed$.next(true);
    }

    onLoad() {
        this.userInfo = this.userService.getUser();
        this.IgcDockManagerLayout = this.layoutService.getlayoutTranslator();
        this.translatorUserId = { user_id: this.userService.getUser().id };
        this.checklistService.getChecklist().subscribe((checklist) => {
            this.previousChecklist = checklist;
        });
        this.loadingDashboardDetails = true;
        this.initializeData();
        this.eventBus
            .on('rejectOrder:rejectResponse')
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response) => {
                if (response) {
                    this.projects = this.projects.filter((item) => item.ID !== this.selectedProject.ID);
                }
            });

        this.setContextMenu();
        for (let i = 1; i <= Object.keys(StatusKey).length / 2; i++) {
            const obj = { label: StatusKey[i], value: i };
            this.statuses.push(obj);
        }

        this.eventBus
            .on('translationRequest:totalCount')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.IgcDockManagerLayout = this.layoutService.getlayoutTranslator();
                },
            });
    }

    private initializeData(): void {
        this.translationReqService
            .getTranslator('translator-dashboard/getData', this.translatorUserId)
            .pipe(catchError(() => of({ projects: [] })))
            .subscribe((res: TranslatorDashboardModel) => {
                this.loadingDashboardDetails = false;
                this.projects = res.projects;
                this.selectedProject = res.projects?.[0];
                this.layoutService.changeTCount(this.projects?.length);
                this.IgcDockManagerLayout = this.layoutService.getlayoutTranslator();
            });
    }

    displayView(project) {
        this.selectProjectId = project.ID;
        this.selectedProject = project;
    }

    getProject(project) {
        let disabledContextMenu: string[] = [];
        if (
            this.showTranslationRequestsStatus(project) === OrderStatus.Translated ||
            this.showTranslationRequestsStatus(project) === OrderStatus.Expired
        ) {
            disabledContextMenu = ['Finish Translation', 'Translate', 'Reject Order'];
        }
        if (this.showTranslationRequestsStatus(project) === OrderStatus.InTranslation) {
            disabledContextMenu = ['Reject Order'];
        }
        this.selectedProject = project;
        this.setContextMenu();
        this.contextMenuItems = this.projectTranslationService.afterFinishTranslationMenuHideShow(
            this.contextMenuItems,
            this.showTranslationRequestsStatus(project),
            disabledContextMenu
        );
    }

    recalculateSlider() {
        this.widthHelper =
            0.01 *
                this.pSplitter._panelSizes[0] /*percent of the panel width*/ *
                600 *
                /*width of the panel component*/ -4 /*width of the splitter*/ +
            'px';
    }

    onRowSelect(event) {
        this.existing_Project_Id = event.data.existing_project_id;
    }

    showFinishTRDialog() {
        this.checklist = this.previousChecklist.filter((list) => list.isChecked === false);
        this.displayFinishTRDialog = true;
        this.isOpenTask = true;
    }

    completeTranslation(data) {
        // Get user info
        this.isOpenTask = false;
        this.translatorUserId = this.userInfo.id;

        // Create payloads
        const translationPayload = {
            project_id: data.project_id,
            version_id: data.version_id,
            language_code: data.language_code,
            translator_id: this.translatorUserId,
            translation_request_id: data.translation_request_id,
        };

        const checkListUpdatePayload = {
            projectId: this.selectedProject.project_id,
            translationRequestId: this.selectedProject.translation_request_id,
            check: this.previousChecklist,
            languageId: this.selectedProject.language_id,
        };

        // Complete translation order and update checklist
        this.translationReqService
            .completeTranslationOrder('translator-dashboard/completeTranslationOrder', translationPayload)
            .pipe(
                catchError(() => of(undefined)),
                switchMap((res: ApiBaseResponseModel) => {
                    if (res?.status === 'OK') {
                        return this.checklistService.updateChecklist(checkListUpdatePayload);
                    } else {
                        return of(undefined);
                    }
                })
            )
            .subscribe(() => {
                this.handleCompletionSuccess();
            });
    }

    private handleCompletionSuccess() {
        // Common actions after successful completion
        this.isOpenTask = false;
        this.displayFinishTRDialog = false;
        this.onLoad();
        this.contextMenuItems = this.projectTranslationService.afterFinishTranslationMenuHideShow(
            this.contextMenuItems,
            this.sendKey(this.selectedProject.remainingTime >= 0 ? this.selectedProject.status : 0),
            ['Finish Translation', 'Translate']
        );
    }

    closeFinishTRDialog() {
        this.resetChecklist();
        this.isOpenTask = false;
        this.displayFinishTRDialog = false;
    }

    setPageHeight() {
        const height = this.elementView.nativeElement.offsetHeight - 150;
        const dh = this.elementView.nativeElement.offsetHeight - 32;
        this.contentHeight = `${height}px`;
        this.viewHeight = `${dh}px`;
        this.viewPageLine = height / 50;
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.setPageHeight();
        }, 0);
    }

    sendKey(num) {
        return StatusKey[num];
    }

    navigateTranslate(pdata) {
        const projectData = { ...pdata, fontPath: pdata?.font_path };
        this.projectTranslationService.setCalculateLengthApiPayload(projectData);
        const data = {
            projectId: pdata?.project_id,
            version: pdata?.version_id,
            editorLanguageCode: pdata?.editor_language_code,
            sourceLangCode: pdata?.language_code,
            editorLanguageId: pdata?.editor_language,
            projectName: pdata?.title,
            role: this?.userService?.getUser()?.role,
            userID: this?.userService?.getUser()?.id,
            textNodeCount: pdata?.text_node_counts ? pdata?.text_node_counts : null,
            brandId: pdata?.brand_id,
            projectManagerEmail: pdata?.project_manager_email ? pdata?.project_manager_email : null,
            projectManagerId: pdata?.project_manager_id ? pdata?.project_manager_id : null,
            translationRequestId: pdata?.translation_request_id ? pdata?.translation_request_id : null,
            userProps: this?.userService?.getUser(),
            placeholder: pdata?.placeholder,
            gpConfigIds: pdata?.gpConfigIds ?? [],
        };
        localStorage.setItem('projectProps', JSON.stringify(data));

        const navigationExtras: NavigationExtras = {
            state: {
                id: pdata.project_id,
                version: pdata.version_id,
                title: pdata.title,
                languageCode: pdata.language_code,
                translation_request_id: pdata.translation_request_id,
                role: 'translator',
            },
        };
        if (pdata) {
            this.eventBus.cast('projectData:selectedProject', {
                projectData: pdata,
                translationRequestId: pdata.translation_request_id,
            });
        }
        this.router.navigate(['/main/project-translation'], navigationExtras);
    }

    getBrandsName() {
        return Brand.getAllBrands().map((e) => e.getName().trim());
        // Refactored: return Object.values(BrandsName);
    }

    setContextMenu() {
        this.contextMenuItems = [
            {
                label: 'Translate',
                command: () => {
                    this.navigateTranslate(this.selectedProject);
                },
            },
            {
                label: 'Finish Translation',
                command: () => {
                    this.showFinishTRDialog();
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
    }

    showTranslationRequestsStatus(project) {
        if (project.remainingTime < 0) {
            return this.sendKey(0);
        } else {
            return this.sendKey(this.isTranslationRequestInTranslation(project) ? 4 : project.status);
        }
    }

    setNewIconForStatus(project) {
        return project.status === 1 && project.remainingTime >= 0 && !this.isTranslationRequestInTranslation(project);
    }

    isTranslationRequestInTranslation(project) {
        return project.progress > 0 && project.progress < 100 && project.status !== 5;
    }

    getBrandLogo(num) {
        return Brand.getBrand(num).getLogo();
        // Refactored: return BrandLogoEnum[num];
    }

    getAltText(num) {
        return Brand.getBrand(num).getName().trim();
        // Refactored: return BrandEnum[num];
    }

    getSanityMessage() {
        const translatorSanityModel: TranslatorSanityCheckModel = {
            translationProgress: this.selectedProject?.progress,
            proofreadProgress: this.selectedProject?.proofreadProgress,
            proofread: this.selectedProject?.proofread,
        };

        return this.sanityChecksService.getSanityMessage({
            translator: translatorSanityModel,
            dueDate: this.selectedProject?.due_date,
        });
    }

    private resetChecklist() {
        const resetChecklist = this.previousChecklist.map((list) => {
            const checklist = this.checklist.find((item) => item.check === list.check);

            return checklist ? { ...list, isChecked: false } : list;
        });
        if (this.isOpenTask) this.checklistService.setChecklist(resetChecklist);
    }

    updateCheckList(checklist: ChecklistModel[]) {
        if (this.isOpenTask) {
            return;
        }
        const checkListUpdatePayload: CheckListUpdateRequestModel = {
            projectId: this.selectedProject.project_id,
            languageId: this.selectedProject.language_id,
            translationRequestId: this.selectedProject.translation_request_id,
            check: checklist,
        };
        this.checklistService.updateChecklist(checkListUpdatePayload).subscribe();
    }

    getOrderStatus() {
        return this.sendKey(this.selectedProject.remainingTime >= 0 ? this.selectedProject.status : 0);
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
            data: { dialogHeading: 'Comment', isRejectedByTranslator: true },
        };
    }
}
