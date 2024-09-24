import { Component, OnDestroy, OnInit } from '@angular/core';
import { IgcDockManagerComponent } from 'igniteui-dockmanager';
import { NgEventBus } from 'ng-event-bus';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { LayoutconfigurationService } from 'src/app/core/services/layoutConfiguration/layoutconfiguration.service';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { CommentsService } from 'src/app/core/services/project/project-translation/comments.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { TableService } from 'src/app/core/services/project/project-translation/table.service';
import { UserService } from 'src/app/core/services/user/user.service';
@Component({
    selector: 'app-project-translation',
    templateUrl: './project-translation.component.html',
    styleUrls: ['./project-translation.component.scss'],
})
export class ProjectTranslationComponent implements OnInit, OnDestroy {
    dockManager: IgcDockManagerComponent;
    totalTextNode: number;
    destroyed$ = new Subject<boolean>();
    excludeMetaTextCount = 0;
    constructor(
        private configurationService: LayoutconfigurationService,
        private eventBus: NgEventBus,
        public projectTranslationService: ProjectTranslationService,
        public objMappingService: MappingService,
        public objTabelService: TableService,
        private userService: UserService,
        private commentService: CommentsService
    ) {}

    ngOnInit(): void {
        this.getUpdatedIgniteConfiguration();
        this.configurationService.getSavedLayoutListFromDB();
        this.getTotalTextNode();
        this.onLoad();
    }
    onLoad() {
        let oldActivePane = 'Structure';
        this.configurationService.updateIgnitePanelHeader(this.userService.getUser().role);
        this.dockManager = this.configurationService.getDocManagerLayout();
        this.dockManager.addEventListener('activePaneChanged', () => {
            if (this.dockManager?.activePane?.header != oldActivePane) {
                if (this.dockManager?.activePane?.header === 'Structure') {
                    this.eventBus.cast('translateData:onStructureSelect', '');
                    oldActivePane = 'Structure';
                } else if (this.dockManager?.activePane?.header === 'Table') {
                    this.eventBus.cast('translateData:onTableSelect', '');
                    oldActivePane = 'Table';
                }
            }
        });
        this.objMappingService.getMappingSettingDataPresent();
        this.projectTranslationService.setConfigForProject();
    }
    closeChangeStateDialog() {
        this.projectTranslationService.displayChangeStateDialog = false;
    }
    async getTotalTextNode() {
        const requestData = this.projectTranslationService.getProjectParameters();

        const payload: any = {
            project_id: requestData?.projectId,
            version_id: requestData?.version,
            role: Roles[requestData?.['role']],
        };
        if (Roles[requestData?.['role']] === 'translator') {
            payload.translation_request_id = requestData?.translationRequestId;
            payload.lang = requestData?.sourceLangCode;
        }
        await this.objTabelService
            .getTotalNode(payload, 'tabular-format/total-node')
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                if (res?.status === 'OK') {
                    this.totalTextNode = res?.data[0]?.totalCount;
                    this.projectTranslationService.totalTextNode = res?.data[0]?.totalCount;
                    this.excludeMetaTextCount = res?.data[0]?.excludeMetatextcount;
                }
            });
    }
    getUpdatedIgniteConfiguration() {
        this.eventBus
            .on('configurationService:ignitePanelHeader')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.dockManager = this.configurationService.getDocManagerLayout();
                },
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.commentService.resetState();
        this.projectTranslationService.config = null;
    }
}
