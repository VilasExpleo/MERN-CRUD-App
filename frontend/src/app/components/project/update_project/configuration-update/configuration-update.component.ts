import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { DashboardComponent } from 'src/app/components/dashboard/editor/dashboard.component';
import { ProjectUpdateService } from 'src/app/core/services/project/project-update.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { LocalStorageService } from '../../../../core/services/storage/local-storage.service';
import { UserService } from '../../../../core/services/user/user.service';
import { ProjectStatusEnum, TranslationRoleEnum } from './../../../../../Enumerations';

@Component({
    selector: 'app-configuration-update',
    templateUrl: './configuration-update.component.html',
    styleUrls: ['./configuration-update.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class ConfigurationUpdateComponent implements OnInit {
    finalUpdateProjectDetailsObj;
    selectedProject;
    configItems;
    projectTranslateID;
    selectedValues = [];
    textNodes = [];
    checkedValues;
    msgs: Message[];
    isThresholdInputShow = false;
    thresholdValues = 0;
    userInfo;
    postUserId;
    projectStatusEnum = ProjectStatusEnum;

    constructor(
        private router: Router,
        private dashboardComponent: DashboardComponent,
        private route: ActivatedRoute,
        private projectService: ProjectService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService,
        private localStorageService: LocalStorageService,
        private readonly projectUpdateService: ProjectUpdateService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.projectTranslateID = params['id'];
        });
        this.projectUpdateService.getProjectState().subscribe((res) => {
            this.selectedProject = res;
        });
        this.finalUpdateProjectDetailsObj = this.projectService.getProjectUpdateDetailsData();
        const isUnconstrainedMode =
            parseInt(this.localStorageService.get('translationRole')) === TranslationRoleEnum.Unconstrained;
        this.configItems = [
            {
                name: 'Status change in regards to changes to the Font',
                id: 1,
                key: 'font_change',
                disable: isUnconstrainedMode,
            },
            {
                name: 'Status changes in regards to maximum value for Size Increase (pixel width, row count, char count)',
                id: 2,
                key: 'size_increase',
                disable: isUnconstrainedMode,
            },
            //TODO
            // {
            //   name: 'Status changes in regards to maximum value for size decrease (pixel width, row count, char count)',
            //   id: 3,
            //   key: 'size_decrease',
            // },
            //TODO
            {
                name: 'Status change for the Linebreak mode',
                id: 4,
                key: 'line_break_change',
                disable: isUnconstrainedMode,
            },
            {
                name: 'Status change in regards to the Metadata (length calculations, Grammar Parser, fonts)',
                id: 5,
                key: 'metadata_change',
                disable: isUnconstrainedMode,
            },
            {
                name: 'Status change in regards to Punctuation marks at sentence termination',
                id: 6,
                key: 'punctuation_change',
                disable: false,
            },
            {
                name: 'Status change for Significant changes in the Model text',
                id: 7,
                key: 'model_text_change',
                disable: false,
            },
        ];

        this.checkedValues = {
            font_change: 0,
            bookmark_change: 0,
            size_increase: 0,
            size_decrease: 0,
            line_break_change: 0,
            metadata_change: 0,
            punctuation_change: 0,
            model_text_change: 0,
            word_wrap_change: 0,
        };

        if (this.finalUpdateProjectDetailsObj.configuredOptions) {
            this.selectedValues = this.finalUpdateProjectDetailsObj.configuredOptions;
            this.checkedValues = this.finalUpdateProjectDetailsObj.checkedValues;
            this.thresholdValues = this.finalUpdateProjectDetailsObj.thresholdValues;
        } else {
            this.userInfo = this.userService.getUser();
            this.postUserId = { user_id: this.userInfo.id };
            this.projectService
                .getProjectUpdateConfiguration('project-update/get-update-configuration', this.postUserId)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res: any) => {
                    if (res?.status === 'OK') {
                        for (const key in res.data[0]) {
                            this.checkedValues[key] = res.data[0][key];
                            const configItemFind = this.configItems.find(
                                (item) => item.key === key && res.data[0][key] === 1
                            );
                            if (!configItemFind?.disable) this.selectedValues.push({ ...configItemFind });

                            if (configItemFind?.key === 'model_text_change')
                                this.thresholdValues = res.data[0]['threshold_value'];
                        }
                        this.selectedValues = [...this.selectedValues];
                        this.finalUpdateProjectDetailsObj.configuredOptions = this.selectedValues;
                        this.finalUpdateProjectDetailsObj.checkedValues = this.checkedValues;
                        this.finalUpdateProjectDetailsObj.thresholdValues = this.thresholdValues;
                    }
                });
        }
    }

    getCheckboxValue() {
        for (const key in this.checkedValues) {
            if (this.selectedValues?.find((item) => item.key === key)) {
                this.checkedValues[key] = 1;
            } else {
                this.checkedValues[key] = 0;
            }
        }
        this.finalUpdateProjectDetailsObj.configuredOptions = this.selectedValues;
        this.finalUpdateProjectDetailsObj.checkedValues = this.checkedValues;
        this.finalUpdateProjectDetailsObj.thresholdValues = this.thresholdValues;
    }

    showConfirm() {
        this.messageService.clear();
        this.confirmationService.confirm({
            message: 'The data may be lost if you click on Yes. Are you sure you want to cancel?',
            header: 'Cancel Project',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.dashboardComponent.closeDialogeOnCancel();
                this.router.navigate(['main/dashboard']);
                this.projectService.setProjectUpdateDetailsData('');
            },
            reject: () => {
                this.messageService.clear('clear');
            },
        });
    }
    nextPage() {
        this.router.navigate([`main/dashboard/summary-start-execution/${this.projectTranslateID}`]);
        this.finalUpdateProjectDetailsObj.thresholdValues = this.thresholdValues;
        this.finalUpdateProjectDetailsObj.checkedValues = this.checkedValues;
    }
    prevPage() {
        this.router.navigate([`main/dashboard/upload-xml/${this.projectTranslateID}`]);
    }
}
