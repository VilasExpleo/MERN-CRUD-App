import { Component, OnDestroy, OnInit } from '@angular/core';
import { IgcDockManagerLayout } from '@infragistics/igniteui-dockmanager';
import { NgEventBus } from 'ng-event-bus';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ChecklistService } from 'src/app/core/services/translation-request/checklist.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { ProjectManagerTR } from 'src/app/shared/models/translation-request/pm-translation-request';
import {
    TranslationResponse,
    UpdateTranslationRequest,
} from './components/dialogs/complete-translation-request/complete-translation-request.model';
import {
    LanguageTranslationRequest,
    ProjectTranslationRequest,
} from './components/grid/translation-request-grid.model';
import { ProjectManagerDashboardModel, initializeProjectManagerDashboard } from './project-manager-dashboard.model';
import { ProjectManagerDashboardTransformer } from './project-manager-dashboard.transformer';
import { OverlayHeaders, StatusKey, TranslationRequestStatus } from 'src/Enumerations';
import { OverlayPanelComponent } from 'src/app/shared/components/overlay-panel/overlay-panel.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProjectManagerService } from 'src/app/core/services/project-manager-service/project-manager.service';
@Component({
    selector: 'app-project-manager-dashboard',
    templateUrl: './project-manager-dashboard.component.html',
    styleUrls: ['./project-manager-dashboard.component.scss'],
})
export class ProjectManagerDashboardComponent implements OnInit, OnDestroy {
    model: ProjectManagerDashboardModel = initializeProjectManagerDashboard;
    layout: IgcDockManagerLayout;
    selectedProject: ProjectTranslationRequest;
    // TODO: Remove dto once models from backend are in camel case
    selectedProjectDto: ProjectManagerTR;
    translationResponse: TranslationResponse;
    isLoading: boolean;
    isNoLanguageDialogVisible: boolean;
    isStatisticalEvaluationDialogVisible: boolean;
    isTranslationRequestDialogVisible: boolean;
    destroyed$ = new Subject<boolean>();
    checklist: ChecklistModel[];

    constructor(
        private readonly projectService: ProjectService,
        private readonly translationRequestService: TranslationRequestService,
        private readonly layoutService: DashboardLayoutService,
        private readonly projectManagerDashboardTransformer: ProjectManagerDashboardTransformer,
        private readonly eventBus: NgEventBus,
        private readonly dialogService: DialogService,
        private readonly projectManagerService: ProjectManagerService,
        private readonly checklistService: ChecklistService
    ) {}

    ngOnInit(): void {
        this.onLoad();
        this.eventBus
            .on('translationRequest:totalCount')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.layout = this.layoutService.getLayoutForProjectManagerDashboard();
                },
            });
        this.getOrders();
        this.checklistService.getChecklist().subscribe((checklist) => {
            this.checklist = checklist;
        });
    }

    selectProject(project: ProjectTranslationRequest) {
        this.selectedProject = project;
        this.selectedProjectDto = this.projectManagerDashboardTransformer.convertToDto(project);
    }

    closeTranslationRequestDialog() {
        this.isTranslationRequestDialogVisible = false;
    }

    updateTranslationRequestStatus(updateTranslationRequest: UpdateTranslationRequest) {
        if (updateTranslationRequest.isAssigned) {
            // TODO: show an toast message of translation update and handle error in else case
            this.selectedProject.dueDateToProjectManager = updateTranslationRequest.dueDatePM;
            this.selectedProject.editorTranslationStatus = TranslationRequestStatus.Assigned;
        }
    }

    toggleStaticalEvaluationDialog() {
        this.isStatisticalEvaluationDialogVisible = !this.isStatisticalEvaluationDialogVisible;
    }

    toggleNoLanguageDialog() {
        this.isNoLanguageDialogVisible = !this.isNoLanguageDialogVisible;
    }

    showCompleteTranslationRequestDialog() {
        this.isTranslationRequestDialogVisible = true;
        this.translationResponse = {
            dueDate: this.selectedProject.editorDueDate,
            projectManagerDueDate: this.selectedProject.dueDateToProjectManager,
            completedCount: this.getReturnedLanguagesCount(),
            totalCount: this.selectedProject['languages']?.length,
        };
    }
    completeTranslation() {
        this.translationRequestService
            .completeProjectTranslationRequest(this.selectedProject)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (response) {
                    this.selectedProject.editorTranslationStatus = StatusKey.Translated;
                }
            });
        this.isTranslationRequestDialogVisible = false;
    }

    private onLoad() {
        this.isLoading = true;
        this.layout = this.layoutService.getLayoutForProjectManagerDashboard();
        this.eventBus.on('projectManager:rejectResponse').subscribe((response) => {
            if (response) {
                this.getOrders();
            }
        });
    }

    getOrders(): void {
        this.projectService
            .getTranslationRequests('project-manager-dashboard/getData')
            .pipe(catchError(() => of(initializeProjectManagerDashboard)))
            .subscribe((response: ProjectManagerDashboardModel) => {
                this.isLoading = false;
                this.model = response;
                this.selectedProject = response.grid.projects[0];
                this.selectedProjectDto = this.projectManagerDashboardTransformer.convertToDto(
                    response.grid.projects[0]
                );
                this.updateOrderCountInDocManager(response.grid.projects.length);
                this.layoutService.setTranslationRequestCount(0);
            });
    }

    private updateOrderCountInDocManager(projectCount: number) {
        this.layoutService.changePmCount(projectCount);
        this.layout = this.layoutService.getLayoutForProjectManagerDashboard();
    }

    private getReturnedLanguagesCount() {
        return this.selectedProject.languages.filter(
            (language: LanguageTranslationRequest) => language.returnDate !== ''
        ).length;
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
    }

    uploadDocuments(count: number) {
        this.selectedProject.documentCount = count;
    }

    rejectOrder() {
        const commentDialogRef: DynamicDialogRef = this.dialogService.open(
            OverlayPanelComponent,
            this.getDialogDefaultConfig()
        );
        commentDialogRef.onClose.subscribe((comment) => {
            if (comment) {
                this.projectManagerService.rejectOrder(this.selectedProject, comment);
            }
        });
    }

    private getDialogDefaultConfig() {
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
            data: { dialogHeading: OverlayHeaders.rejectReason, isRejectedByProjectManager: true },
        };
    }
}
