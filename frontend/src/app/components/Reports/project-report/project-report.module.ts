import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddReportComponent } from './add-report/add-report.component';
import { GenerateReportComponent } from './generate-report/generate-report.component';
import { HistoryComponent } from './history/history.component';
import { ReportFilterPipe } from './pipes/report-filter/report-filter.pipe';
import { ProjectReportComponent } from './project-report.component';
import { ReportItemComponent } from './report-item/report-item.component';
import { ReportPreviewComponent } from './report-preview/report-preview.component';
import { CreateScheduleComponent } from './schedule-report/create-schedule/create-schedule.component';
import { WeeklyScheduleComponent } from './schedule-report/create-schedule/weekly-schedule/weekly-schedule.component';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';
@NgModule({
    declarations: [
        ProjectReportComponent,
        GenerateReportComponent,
        AddReportComponent,
        ReportPreviewComponent,
        ReportItemComponent,
        ReportFilterPipe,
        ScheduleReportComponent,
        CreateScheduleComponent,
        WeeklyScheduleComponent,
        HistoryComponent,
    ],
    imports: [SharedModule, DynamicDialogModule, ConfirmDialogModule, TableModule, CalendarModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        ProjectReportComponent,
        GenerateReportComponent,
        AddReportComponent,
        ReportPreviewComponent,
        ReportItemComponent,
        ReportFilterPipe,
    ],
})
export class ProjectReportModule {}
