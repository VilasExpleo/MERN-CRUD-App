import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { RejectOrderService } from 'src/app/core/services/reject-order/reject-order.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ChecklistService } from 'src/app/core/services/translation-request/checklist.service';
import { IUserModel } from 'src/app/core/services/user/user.model';
import { OverlayPanelComponent } from 'src/app/shared/components/overlay-panel/overlay-panel.component';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { Brand } from 'src/app/shared/models/brand';
import { ProofreaderDashboardRequestModel } from 'src/app/shared/models/proofreader/proofread-api.model';
import {
    ProjectProofreadStatus,
    ProofreadStatus,
    Status,
    TranslationRequestsStatusEnum,
    tableIcons,
} from './../../../../Enumerations';
import { ProofreaderService } from './../../../core/services/proofread-service/proofread-service';
import { UserService } from './../../../core/services/user/user.service';
import { OrderStatus, ProofreadLanguageRow, ProofreaderDashboardModel, ProofreaderModel } from './proofreader.model';
import { MetaData, NgEventBus } from 'ng-event-bus';

@Component({
    selector: 'app-proofreader-dashboard',
    templateUrl: './proofreader-dashboard.component.html',
    styleUrls: ['./proofreader-dashboard.component.scss'],
})
export class ProofreaderDashboardComponent implements OnInit {
    IgcDockManagerLayout: object = {};
    contextMenuItems: MenuItem[] = [];
    projects: ProofreaderModel[] = [];
    selectedProject: ProofreaderModel;
    selectedProjectId: number;
    loading = true;
    ProjectProofreadStatus = ProjectProofreadStatus;
    statusIcon = Status;
    tableIcons = tableIcons;
    ProofreadStatus = ProofreadStatus;
    contentId = 'proofread';
    orderStatus: OrderStatus[];
    selectedProofreadProject: ProofreaderModel;
    checklist: ChecklistModel[];
    isRejectOrderVisible = false;
    userInfo: IUserModel;
    selectedProofreadLanguageRow: ProofreadLanguageRow;
    proofreadLanguages;
    constructor(
        private readonly layoutService: DashboardLayoutService,
        private readonly proofreaderService: ProofreaderService,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly projectService: ProjectService,
        private readonly projectReportService: ProjectReportService,
        private readonly projectTranslationService: ProjectTranslationService,
        private readonly checklistService: ChecklistService,
        private readonly dialogService: DialogService,
        private readonly rejectOrderService: RejectOrderService,
        private readonly eventBus: NgEventBus
    ) {}

    ngOnInit() {
        this.IgcDockManagerLayout = this.layoutService.getDefaultLayout(this.contentId);
        this.onLoad();
        this.initializeContextMenu();
        this.checklistService.getChecklist().subscribe((checklist) => {
            this.checklist = checklist;
        });
        this.userInfo = this.userService.getUser();
        this.orderStatus = [
            { id: '1', label: 'New' },
            { id: '5', label: 'Closed' },
            { id: '6', label: 'In-progress' },
            { id: '7', label: 'Expired' },
        ];

        this.eventBus.on('rejectOrder:rejectResponse').subscribe((response: MetaData) => {
            this.afterRejectOrderFilterProject(response);
        });
    }

    afterRejectOrderFilterProject(response: MetaData) {
        if (response) {
            if (this.selectedProject?.languages.length <= 1) {
                this.projects = this.projects.filter((item) => item.projectId !== this.selectedProject?.projectId);
            } else {
                this.proofreadLanguages = this.proofreadLanguages.filter(
                    (item) => item.targetLanguage.id !== this.selectedProofreadLanguageRow?.targetLanguage.id
                );
                this.selectedProject.languages = this.proofreadLanguages;
            }
        }
    }

    selectTranslationRequest(project) {
        this.isRejectOrderVisible = project?.status !== TranslationRequestsStatusEnum.New;
        this.selectedProject = project;
        this.selectedProofreadProject = project;
    }

    getBrandsName() {
        return Brand.getAllBrands().map((e) => e.getName());
        // Refactored: return Object.values(BrandsName);
    }

    getCSSClassForDueDate(project: ProofreaderModel) {
        const remainingTime = project.remainingTime;
        if (remainingTime < 0) {
            return 'text-red-500';
        } else {
            return 'ok';
        }
    }

    getVersion(versionId: number) {
        return +versionId.toString().split('.')[1];
    }

    getColorClassForStatus(status: ProjectProofreadStatus): string {
        let cssClass: string;
        switch (status) {
            case ProjectProofreadStatus.New: {
                cssClass = 'New';
                break;
            }

            case ProjectProofreadStatus.Closed: {
                cssClass = 'Closed';
                break;
            }

            case ProjectProofreadStatus.InProgress: {
                cssClass = 'In-progress';
                break;
            }

            case ProjectProofreadStatus.Expired: {
                cssClass = 'Expired';
                break;
            }
            default: {
                cssClass = null;
                break;
            }
        }
        return cssClass;
    }

    getColorForProofreadStatus(status: ProjectProofreadStatus): string {
        let statusValue: Status;
        switch (status) {
            case ProjectProofreadStatus.New: {
                statusValue = this.statusIcon.New;
                break;
            }

            case ProjectProofreadStatus.Closed: {
                statusValue = this.statusIcon.Closed;
                break;
            }

            case ProjectProofreadStatus.InProgress: {
                statusValue = this.statusIcon['In-progress'];
                break;
            }

            case ProjectProofreadStatus.Expired: {
                statusValue = this.statusIcon.Expired;
                break;
            }
            default: {
                statusValue = null;
                break;
            }
        }

        return statusValue?.toString();
    }

    getSelectedProjectData(project: ProofreaderModel, row: ProofreadLanguageRow) {
        this.proofreadLanguages = project.languages;
        if (row.rejectedNodes > 0 || row.proofreadNodes > 0) {
            this.contextMenuItems[2].disabled = true;
        } else {
            this.contextMenuItems[2].disabled = false;
        }

        if (project.status === ProjectProofreadStatus.Expired || project.status === ProjectProofreadStatus.Closed) {
            this.contextMenuItems[0].disabled = true;
        } else {
            this.contextMenuItems[0].disabled = false;
        }

        this.selectedProofreadLanguageRow = row;
        this.projectService.getSelectedProjectData(project, row);
    }

    private initializeContextMenu() {
        this.contextMenuItems = [
            {
                label: 'Proofread',
                command: () => {
                    this.navigateToTranslation();
                },
                disabled: false,
            },
            {
                label: 'Report',
                command: () => {
                    this.projectReportService.showProjectReport(this.selectedProofreadProject);
                },
            },
            {
                label: 'Reject Order',
                command: () => {
                    this.openRejectOrderDialog();
                },
                disabled: false,
            },
        ];
    }

    private navigateToTranslation() {
        this.projectTranslationService.setCalculateLengthApiPayload(this.selectedProject);
        this.router.navigate(['/main/project-translation']);
    }

    private onLoad() {
        this.loading = true;

        this.proofreaderService
            .getProofreaderRequests(this.getRequestPayload())
            .pipe(catchError(() => of({ projects: [] })))
            .subscribe({
                next: (response: ProofreaderDashboardModel) => {
                    this.loading = false;
                    this.projects = response.projects;
                    this.selectedProject = response.projects[0];
                    this.layoutService.proofreaderOrdersCount(this.projects?.length);
                    this.IgcDockManagerLayout = this.layoutService.getDefaultLayout(this.contentId);
                },
            });
    }

    private getRequestPayload(): ProofreaderDashboardRequestModel {
        return {
            userId: this.userService.getUser().id,
            end: 0,
            start: 0,
        };
    }

    updateStatusOnExpand(project: ProofreaderModel) {
        const isAnyLanguageNotReturned = project.languages.find((language) => !language.returnDate);
        if (project.status === ProjectProofreadStatus.Closed) {
            return;
        }
        if (!isAnyLanguageNotReturned) {
            this.updateStatus(project, ProjectProofreadStatus.Closed);
        }
        if (project.remainingTime < 0 && project.status !== ProjectProofreadStatus.Expired) {
            this.updateStatus(project, ProjectProofreadStatus.Expired);
        }
        if (project.status === ProjectProofreadStatus.New) {
            this.updateStatus(project, ProjectProofreadStatus.InProgress);
        }
    }

    private updateStatus(project: ProofreaderModel, status: ProjectProofreadStatus) {
        const index = this.projects.findIndex((request) => request.projectId === project.projectId);
        project.status = status;
        this.projects.splice(index, 1, project);

        const requestPayload = {
            translationRequestId: project.translationRequestId,
            status: project.status,
            languages: project.languages.map((language) => language.targetLanguage?.['code']),
        };

        this.proofreaderService.updateProofreaderRequestStatus(requestPayload).subscribe();
    }

    private openRejectOrderDialog(): void {
        const commentDialogRef: DynamicDialogRef = this.dialogService.open(
            OverlayPanelComponent,
            this.getDialogDefaultConfig()
        );
        commentDialogRef.onClose.subscribe((comment) => {
            if (comment) {
                this.rejectOrderService.rejectOrder(
                    this.selectedProject,
                    comment,
                    this.userInfo,
                    this.selectedProofreadLanguageRow
                );
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
            data: { dialogHeading: 'Comment', isRejectedByTranslationManager: true, linkId: 'proofread-reject-order' },
        };
    }
}
