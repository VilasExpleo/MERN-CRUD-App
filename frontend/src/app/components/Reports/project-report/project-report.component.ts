import { Component, Input, OnInit, Optional } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ReportPanelSource, Roles } from 'src/Enumerations';
import { UserService } from 'src/app/core/services/user/user.service';
import { ReportData } from 'src/app/shared/models/reports/report.data';
import { User } from 'src/app/shared/models/user';

@Component({
    selector: 'app-project-report',
    templateUrl: './project-report.component.html',
})
export class ProjectReportComponent implements OnInit {
    user: User;
    isEditor = false;

    @Input()
    reportData: ReportData;

    reportHistoryHeaderText = 'Report History';

    constructor(private userService: UserService, @Optional() private dialogConfig: DynamicDialogConfig) {}

    ngOnInit(): void {
        this.user = this.userService.getUser();
        this.isEditor = this.user?.role === Roles.editor;
        this.reportData = this.dialogConfig?.data;
    }

    get getFirstTabName() {
        return this.reportData?.pageSource === ReportPanelSource.Settings ? 'Manage' : 'Generate';
    }
}
