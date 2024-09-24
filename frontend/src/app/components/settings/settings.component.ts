import { UserService } from './../../core/services/user/user.service';
import { Roles } from './../../../Enumerations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReportData } from 'src/app/shared/models/reports/report.data';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
    isPopupMaximized = false;
    @Input()
    viewSetting: boolean;

    @Input()
    isMappingAssistent;

    @Input()
    selectedProject;

    @Output() hideSetting: EventEmitter<any> = new EventEmitter();

    aboutHMILHeaderText = 'About HMI Linguist';
    notificationHeaderText = 'Notification';
    isProofreader: boolean;
    isReviewer: boolean;

    constructor(private userService: UserService) {}

    ngOnInit(): void {
        this.initializeRoles();
    }

    initializeRoles() {
        this.isProofreader = this.userService.getUser()?.role === Roles.proofreader;
        this.isReviewer = this.userService.getUser()?.role === Roles.reviewer;
    }

    onMaximize() {
        this.isPopupMaximized = !this.isPopupMaximized;
    }

    closeSetting() {
        this.hideSetting.emit();
    }

    getReportData(): ReportData {
        return {
            generateReportTitle: `List of report created by you. You can delete unused or deprecated reports by clicking on the Button on the according list entry.`,
            pageSource: 'settings',
        };
    }
}
