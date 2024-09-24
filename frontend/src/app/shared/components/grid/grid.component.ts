import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Roles, TableContextMenu, TextNodeStatus } from 'src/Enumerations';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ReviewerService } from 'src/app/core/services/reviewer/reviewer.service';
import { UserService } from './../../../core/services/user/user.service';
import { GridModel, RequestModel, TargetLanguageRequestModel } from './grid.model';
import { ReviewTypeEnum } from 'src/app/components/dashboard/order-review/components/language/review-type.enum';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
})
export class GridComponent {
    @Input()
    model: GridModel;

    @Input()
    maximumRowsToShow = 10;

    @Output()
    requestSelectionEvent = new EventEmitter<RequestModel>();

    @Output()
    showFinishOrderDialogEvent = new EventEmitter();

    @Output()
    requestSelectionLanguageWiseEvent = new EventEmitter<TargetLanguageRequestModel>();

    @Input()
    linkId = 'reviewer-dashboard';

    textNodeStatus = TextNodeStatus;
    contextMenuItems: MenuItem[] = [];
    order: TargetLanguageRequestModel;
    request: RequestModel;
    reviewType = ReviewTypeEnum;
    constructor(
        private readonly router: Router,
        private readonly projectService: ProjectService,
        private readonly reviewerService: ReviewerService,
        private readonly userService: UserService,
        private readonly projectReportService: ProjectReportService,
        private readonly projectTranslationService: ProjectTranslationService
    ) {
        this.initializeContextMenu();
    }

    setRequest(request, order: TargetLanguageRequestModel) {
        this.order = order;
        this.projectService.getSelectedProjectData(request, order);
        this.disabledContextMenuForExpiredOrClosedRequest(request);
    }

    disabledContextMenuForExpiredOrClosedRequest(project: RequestModel) {
        for (const i in this.contextMenuItems) {
            if (
                this.contextMenuItems[i].label !== TableContextMenu.Report &&
                (project.status === TextNodeStatus.Expired || project.status === TextNodeStatus.Closed)
            ) {
                this.contextMenuItems[i].disabled = true;
            } else {
                this.contextMenuItems[i].disabled = false;
            }
        }
    }

    selectRequest(request: RequestModel) {
        this.request = request;
        this.requestSelectionEvent.emit(request);
    }

    getCSSClassForDueDate = (request: RequestModel) => {
        const remainingTime = request.remainingTime;
        let cssClass: string;
        if (remainingTime >= 0 && remainingTime < 2) {
            cssClass = 'text-yellow-500';
        }

        if (remainingTime < 0) {
            cssClass = 'text-red-500';
        }

        return cssClass;
    };

    getFormattedStatus(status: number) {
        const formattedStatus = {
            cssClasses: '',
            icons: 'pi ',
        };

        switch (status) {
            case TextNodeStatus.New: {
                formattedStatus.cssClasses = 'bg-blue-100 text-blue-500';
                formattedStatus.icons = formattedStatus.icons + 'pi-star';
                break;
            }

            case TextNodeStatus['In-progress']: {
                formattedStatus.cssClasses = 'bg-yellow-100 text-yellow-500';
                formattedStatus.icons = formattedStatus.icons + 'pi-spinner';
                break;
            }

            case TextNodeStatus.Closed: {
                formattedStatus.cssClasses = 'bg-green-100 text-green-500';
                formattedStatus.icons = formattedStatus.icons + 'pi-check-circle';
                break;
            }

            case TextNodeStatus.Expired: {
                formattedStatus.cssClasses = 'bg-red-100 text-red-500';
                formattedStatus.icons = formattedStatus.icons + 'pi-clock';
                break;
            }
        }

        return formattedStatus;
    }

    updateStatusOnExpand(project: RequestModel) {
        if (project.remainingTime < 0 && project.status !== TextNodeStatus.Expired) {
            this.updateStatus(project, TextNodeStatus.Expired);
        } else if (project.status === TextNodeStatus.New) {
            this.updateStatus(project, TextNodeStatus['In-progress']);
        }
    }

    private initializeContextMenu() {
        const role = this.userService.getUser().role;
        // TODO: Change in switch while integrate with other roles
        if (role === Roles.reviewer) {
            this.contextMenuItems = [
                {
                    label: 'Review',
                    command: () => {
                        this.navigateToTranslation();
                    },
                    disabled: false,
                },
                {
                    label: 'Finish Order',
                    command: () => {
                        this.showFinishOrderDialogEvent.emit(this.order);
                    },
                    disabled: false,
                },
                {
                    label: 'Report',
                    command: () => {
                        this.projectReportService.showProjectReport(this.request);
                    },
                },
            ];
        }
    }

    private navigateToTranslation(): void {
        this.projectTranslationService.setCalculateLengthApiPayload(this.request);
        this.router.navigate(['/main/project-translation']);
    }

    private updateStatus(project: RequestModel, status: TextNodeStatus) {
        const index = this.model.requests.findIndex((request) => request.id === project.id);
        project.status = status;
        this.model.requests.splice(index, 1, project);

        const requestPayload = {
            userId: this.userService.getUser().id,
            requestId: project.id,
            status: status,
        };

        this.reviewerService.updateReviewRequestStatus(requestPayload).subscribe();
    }

    checkClosedStatus(request: RequestModel) {
        const findNullDate = request.targetLanguages
            .map((date) => date.returnDate)
            .filter((item) => item !== undefined);
        if (findNullDate.length === request.targetLanguages.length) {
            request.status = TextNodeStatus.Closed;
        }
        return request;
    }

    onContextMenuSelect(_, contextMenu) {
        if (this.contextMenuItems.length === 0) {
            contextMenu.hide();
        }
    }
}
