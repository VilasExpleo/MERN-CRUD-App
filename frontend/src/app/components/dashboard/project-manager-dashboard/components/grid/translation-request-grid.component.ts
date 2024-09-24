import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
    ResponseStatusEnum,
    StatusKey,
    TranslationRequestStatus,
    TranslationRequestsStatusEnum,
    TranslationRequestsStatusIconEnum,
} from 'src/Enumerations';
import { ProjectManagerService } from 'src/app/core/services/project-manager-service/project-manager.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { Brand } from 'src/app/shared/models/brand';
import { ProjectManagerDashboardTransformer } from '../../project-manager-dashboard.transformer';
import { ReassignTranslationManagerComponent } from '../dialogs/reassign-translation-manager/reassign-translation-manager.component';
import {
    LanguageTranslationRequest,
    ProjectTranslationRequest,
    TranslationRequestGridModel,
} from './translation-request-grid.model';

@Component({
    selector: 'app-translation-request-grid',
    templateUrl: './translation-request-grid.component.html',
    styleUrls: ['./translation-request-grid.component.scss'],
})
export class TranslationRequestGridComponent {
    @Input()
    selectedProject: ProjectTranslationRequest;

    @Input()
    model: TranslationRequestGridModel;

    @Output()
    projectSelectionEvent = new EventEmitter<ProjectTranslationRequest>();

    @Output()
    staticalEvaluationEvent = new EventEmitter();

    @Output()
    showCompleteTranslationRequestDialogEvent = new EventEmitter();

    @Output()
    noLanguageDialogEvent = new EventEmitter();

    @Output()
    rejectOrderEvent = new EventEmitter();

    maximumRowsToShow = 10;
    translationRequestDropdownOptions: { label: string; value: number }[];
    projectTitle: string;
    contextMenus: MenuItem[];
    translationRequestsStatusEnum = TranslationRequestsStatusEnum;
    translationRequestsStatusIconEnum = TranslationRequestsStatusIconEnum;
    childContextMenu: MenuItem[];
    childRow;

    constructor(
        private readonly projectManagerService: ProjectManagerService,
        private readonly projectManagerTransformer: ProjectManagerDashboardTransformer,
        private readonly projectTranslationService: ProjectTranslationService,
        private readonly projectReportService: ProjectReportService,
        private readonly dialogService: DialogService
    ) {
        this.translationRequestDropdownOptions = this.getDropdownOptionsFromTranslationRequestStatuses();
        this.contextMenus = this.getContextMenu();
    }

    selectProject(project: ProjectTranslationRequest) {
        const translationStatus = this.sendKey(project.editorTranslationStatus);
        let disabledContextMenuList: string[] = [];
        switch (translationStatus) {
            case 'Translated':
                disabledContextMenuList = ['Assign Translation Manager', 'Finish Translation Request', 'Reject Order'];
                break;
            case 'Assigned':
                disabledContextMenuList = ['Assign Translation Manager', 'Reject Order'];
                break;
            case 'In Translation':
                disabledContextMenuList = ['Reject Order'];
                break;
        }
        this.contextMenus = this.projectTranslationService.afterFinishTranslationMenuHideShow(
            this.contextMenus,
            translationStatus,
            disabledContextMenuList
        );
        this.projectSelectionEvent.emit(project);
    }

    getTranslationRequestStatus(translationRequestValue: number) {
        return Object.keys(TranslationRequestStatus).find(
            (key) => TranslationRequestStatus[key] === translationRequestValue
        );
    }

    isNewTranslationRequest(translationRequestValue: number) {
        return translationRequestValue === TranslationRequestStatus.New;
    }

    returnedTranslations(languages: LanguageTranslationRequest[]) {
        const languagesWithReturnDate = languages.filter(
            (language: LanguageTranslationRequest) => language.returnDate !== ''
        ).length;
        return `${languagesWithReturnDate}/${languages.length}`;
    }

    getCSSClassForSelectedProject(project: ProjectTranslationRequest) {
        return project.projectId === this.selectedProject.projectId &&
            project.versionId === this.selectedProject.versionId &&
            project.id === this.selectedProject.id
            ? 'selected-row'
            : '';
    }

    getCSSClassForBell(project: ProjectTranslationRequest) {
        const remainingTime = project?.['remainingTime'];
        if (remainingTime >= 0 && remainingTime < 2) {
            return 'warning';
        } else if (remainingTime < 0) {
            return 'danger';
        } else {
            return 'ok';
        }
    }

    getProgress(project: ProjectTranslationRequest) {
        return project.progress && project.editorTranslationStatus !== TranslationRequestStatus.Translated;
    }

    private assignTranslationManagerDialog() {
        if (this.selectedProject.languages.length > 0) {
            this.projectManagerService.openAssignTransalationManagerAssignDialog(
                this.projectManagerTransformer.convertToDto(this.selectedProject)
            );
        } else {
            this.noLanguageDialogEvent.emit();
        }
    }

    private getDropdownOptionsFromTranslationRequestStatuses() {
        return Object.keys(TranslationRequestStatus).map((key: string) => ({
            label: key,
            value: TranslationRequestStatus[key],
        }));
    }

    private getContextMenu() {
        return [
            {
                icon: 'pi pi-user-plus',
                label: 'Assign Translation Manager',
                command: () => {
                    this.assignTranslationManagerDialog();
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Finish Translation Request',
                command: () => {
                    this.showCompleteTranslationRequestDialogEvent.emit();
                },
            },
            {
                icon: 'pi pi-times',
                label: 'Reject Order',
                command: () => {
                    this.rejectOrderEvent.emit();
                },
            },
            {
                icon: 'pi pi-chart-line',
                label: 'Statistical Evaluation',
                command: () => {
                    this.staticalEvaluationEvent.emit(this.selectedProject);
                },
            },
            {
                icon: 'pi pi-download',
                label: 'Report',
                command: () => {
                    this.projectReportService.showProjectReport(this.selectedProject);
                },
            },
        ];
    }

    sendKey(num) {
        return StatusKey[num];
    }

    getBrandsName() {
        return Brand.getAllBrands().map((e) => e.getName().trim());
    }

    getBrandLogo(num) {
        return Brand.getBrand(num).getLogo();
    }

    private getChildContextMenu(): MenuItem[] {
        return [
            {
                icon: 'pi pi-users',
                label: 'Reassign Translation Manager',
                disabled: this.childRow?.status !== TranslationRequestsStatusEnum.Rejected,
                command: () => {
                    this.openReAssignTranslationManagerDialog(this.childRow);
                },
            },
        ];
    }

    private openReAssignTranslationManagerDialog(row): void {
        const assignManagerDialogRef: DynamicDialogRef = this.dialogService.open(ReassignTranslationManagerComponent, {
            header: `Assign Translation Manager`,
            footer: ' ',
            modal: true,
            autoZIndex: true,
            maximizable: false,
            width: '35rem',
            draggable: true,
            data: this.childRow,
        });
        assignManagerDialogRef.onClose.subscribe((data) => {
            if (data?.response?.status === ResponseStatusEnum.OK) {
                row.status = TranslationRequestsStatusEnum.New;
                row.translationManagerEmail = data?.user?.email;
            }
        });
    }

    getSelectedChildRow(childRow) {
        this.childRow = childRow;
        this.childContextMenu = this.getChildContextMenu();
    }
}
