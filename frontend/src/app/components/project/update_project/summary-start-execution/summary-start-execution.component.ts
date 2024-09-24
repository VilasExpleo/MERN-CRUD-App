import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { DashboardComponent } from 'src/app/components/dashboard/editor/dashboard.component';
import { ProjectUpdateService } from 'src/app/core/services/project/project-update.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ProjectStatusEnum } from './../../../../../Enumerations';
@Component({
    selector: 'app-summary-start-execution',
    templateUrl: './summary-start-execution.component.html',
    styleUrls: ['./summary-start-execution.component.scss'],
    providers: [ConfirmationService],
})
export class SummaryStartExecutionComponent implements OnInit {
    projectTranslateID;
    projectUpdateDetails;
    newProjectDate;
    oldProjectName;
    newXmlFile;
    versionId;
    userId;
    postObj;
    updateObj;
    updateSummary;
    configuredOptions;
    xmlDiffrence;
    newLanguageAdded;
    displayScheduleProject!: boolean;
    msgs: Message[];
    scheduleTime;
    disableSchedule: boolean;
    minDateValue = new Date();
    schedulePostObj;
    projectConfig;
    selectedProject;
    languageChange = false;
    projectStatusEnum = ProjectStatusEnum;

    constructor(
        private router: Router,
        private dashboardComponent: DashboardComponent,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private projectService: ProjectService,
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private readonly projectUpdateService: ProjectUpdateService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.projectTranslateID = params['id'];
        });
        this.projectUpdateService.getProjectState().subscribe((res) => {
            this.selectedProject = res;
        });

        this.projectUpdateDetails = this.projectService.getProjectUpdateDetailsData();
        this.onLoad();
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
    onLoad() {
        this.xmlDiffrence = this.projectUpdateDetails?.xmlDifferenceRes?.data?.xml_difference;
        this.newProjectDate = this.projectUpdateDetails?.newProjectDate;
        this.configuredOptions = this.projectUpdateDetails?.configuredOptions;
        this.oldProjectName = this.projectUpdateDetails?.oldProjectName;
        this.newXmlFile = this.projectUpdateDetails?.newXmlFile;
        this.versionId = this.projectUpdateDetails.projectById?.data?.properties[0]['version_no'];
        this.updateSummary = this.projectUpdateDetails?.xmlDifferenceRes?.data?.xml_difference;
        if (this.projectUpdateDetails.checkedValues) {
            this.projectConfig = this.projectUpdateDetails.checkedValues;
        } else {
            this.projectConfig = {};
        }
        if (this.projectUpdateDetails.languageDeleted || this.projectUpdateDetails.languageDiffrence) {
            this.languageChange = true;
        }

        this.userId = this.userService.getUser();
        this.projectConfig['threshold_value'] =
            this.projectConfig['model_text_change'] === 0 ? 0 : this.projectUpdateDetails.thresholdValues;
        this.postObj = {
            xml_data: this.newXmlFile,
            project_id: this.projectTranslateID,
            version_no: this.versionId || this.selectedProject.version_no,
            language_inheritance_tree: '',
            user_id: this.userId.id,
            project_configuration: JSON.stringify(this.projectConfig),
        };

        this.updateObj = {
            title: !this.selectedProject?.isRawProject ? this.selectedProject.title : this.oldProjectName,
            date: !this.selectedProject?.isRawProject ? this.selectedProject.date_created : this.newProjectDate,
            version_no: !this.selectedProject?.isRawProject ? this.selectedProject.version_no : this.versionId,
        };
    }
    showScheduleProject() {
        this.displayScheduleProject = true;
    }
    closeSchedule() {
        this.displayScheduleProject = false;
    }

    scheduleMassOperation() {
        this.projectConfig['threshold_value'] =
            this.projectConfig['model_text_change'] === 0 ? 0 : this.projectUpdateDetails.thresholdValues;
        this.schedulePostObj = {
            xml_data: this.newXmlFile,
            project_id: this.projectTranslateID,
            version_no: this.versionId,
            language_inheritance_tree: '',
            user_id: this.userId.id,
            schedule_datetime: this.scheduleTime,
            project_configuration: JSON.stringify(this.projectConfig),
        };
        const payload = {
            date: this.updateObj?.date,
            projectName: this.updateObj?.title,
            version_no: this.updateObj?.version_no,
        };
        this.dashboardComponent.callFromChildPropertiesofProject(payload, 'SCHEDULE');

        const form_data = new FormData();
        for (const key in this.schedulePostObj) {
            form_data.append(key, this.schedulePostObj[key]);
        }

        this.projectService
            .postScheduleProjectUpdate(form_data)
            .pipe(catchError((error) => of(error)))
            .subscribe((res) => {
                if (res == undefined) {
                    this.dashboardComponent.onLoad();
                    this.msgs = [
                        {
                            severity: 'success',
                            detail: `Project update is scheduled successfully. It will run at scheduled time`,
                        },
                    ];
                }
            });
        this.projectService.setProjectUpdateDetailsData('');
    }
    updateProject() {
        const selectedDueDate = this.selectedProject?.due_date ?? '';

        if (this.updateObj.due_date) {
            this.updateObj.due_date = selectedDueDate;
        }

        if (this.selectedProject?.rawProjectId) {
            this.postObj.rawProjectId = this.selectedProject.rawProjectId;
        }

        const form_data = new FormData();
        for (const key in this.postObj) {
            form_data.append(key, this.postObj[key]);
        }

        this.dashboardComponent.callFromChildProjectUpdate(this.updateObj);
        this.projectService
            .updateProject(form_data)
            .pipe(catchError(() => of(undefined)))
            .subscribe();
        this.projectService.setProjectUpdateDetailsData('');
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

    prevPage() {
        this.router.navigate([`main/dashboard/update-configuration/${this.projectTranslateID}`]);
    }
}
