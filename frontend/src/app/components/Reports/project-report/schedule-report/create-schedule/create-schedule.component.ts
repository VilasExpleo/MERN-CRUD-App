import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ScheduleService } from 'src/app/core/services/reports/schedule.service';
import { ScheduleFrequencyEnum } from 'src/app/shared/models/reports/schedule-frequency.enum';
import { ProjectReportModel } from '../../generate-report/generate-report.model';
import { CreateScheduleModel } from './create-schedule.model';
import { Frequency } from './frequency.model';
import { ScheduleDaysModel } from './schedule-days.model';

@Component({
    selector: 'app-create-schedule',
    templateUrl: './create-schedule.component.html',
})
export class CreateScheduleComponent implements OnInit {
    private selectedScheduleDay: ScheduleDaysModel;
    private report: ProjectReportModel;
    date = new Date();
    frequencies: Frequency[];
    selectedFrequency: Frequency;
    minDateValue = new Date();
    isDaily = false;
    isWeekly = false;
    isMonthly = false;
    dateFormat = 'dd.mm.yy';
    scheduleDays: ScheduleDaysModel[] = [];
    dayOfWeek = '';

    constructor(
        private dialogConfig: DynamicDialogConfig,
        private dynamicDialogRef: DynamicDialogRef,
        private datePipe: DatePipe,
        private scheduleService: ScheduleService
    ) {}

    ngOnInit(): void {
        this.loadFrequency();
        this.loadScheduleDays();
        this.report = this.dialogConfig?.data;
        this.loadScheduledReport();
    }

    loadScheduledReport() {
        switch (this.report.frequency) {
            case ScheduleFrequencyEnum.Daily: {
                this.isDaily = true;
                break;
            }
            case ScheduleFrequencyEnum.Monthly: {
                this.isMonthly = true;
                break;
            }
            default: {
                this.isWeekly = true;
            }
        }
        if (this.report.scheduleTime) {
            this.selectedFrequency = this.frequencies.find((frequency) => frequency.label === this.report.frequency);
            this.date = new Date(
                new Date(
                    `${this.datePipe.transform(new Date(), 'MM')}/${this.report.dayOfMonth}/${this.datePipe.transform(
                        new Date(),
                        'YYYY'
                    )}`
                ).toDateString() +
                    ' ' +
                    this.report.scheduleTime
            );
            this.dayOfWeek = this.report.dayOfWeek;
        } else {
            this.selectedFrequency = this.frequencies[0];
            this.date.setHours(12);
            this.date.setMinutes(0);
        }
        this.selectFrequency(this.selectedFrequency);
    }

    loadFrequency() {
        this.frequencies = [
            { label: 'Daily', value: 'Daily' },
            { label: 'Weekly', value: 'Weekly' },
            { label: 'Monthly', value: 'Monthly' },
        ];
    }

    selectFrequency(selectedFrequency: Frequency): void {
        const frequency = selectedFrequency.value['value'] ?? selectedFrequency.value;
        this.resetFrequency();
        switch (frequency) {
            case ScheduleFrequencyEnum.Daily: {
                this.isDaily = true;
                break;
            }
            case ScheduleFrequencyEnum.Monthly: {
                this.isMonthly = true;
                break;
            }
            default: {
                this.isWeekly = true;
            }
        }
    }

    resetFrequency(): void {
        this.isDaily = false;
        this.isMonthly = false;
        this.isWeekly = false;
    }

    private loadScheduleDays(): void {
        this.scheduleDays = [
            { day: 'Sun', fullDay: 'Sunday', isSelected: false },
            { day: 'Mon', fullDay: 'Monday', isSelected: false },
            { day: 'Tue', fullDay: 'Tuesday', isSelected: false },
            { day: 'Wed', fullDay: 'Wednesday', isSelected: false },
            { day: 'Thur', fullDay: 'Thursday', isSelected: false },
            { day: 'Fri', fullDay: 'Friday', isSelected: false },
            { day: 'Sat', fullDay: 'Saturday', isSelected: false },
        ];
    }

    selectDay(scheduleDaysModel: ScheduleDaysModel) {
        scheduleDaysModel.isSelected = true;
        this.selectedScheduleDay = scheduleDaysModel;
    }

    selectSchedule() {
        this.scheduleService.reportSchedules$.next(
            this.scheduleService.reportSchedules$.getValue().concat([this.getSelectedSchedule()])
        );
        this.dynamicDialogRef.close();
    }

    getSelectedSchedule(): CreateScheduleModel {
        return {
            reportId: this.report?.id,
            dayOfMonth: +this.datePipe.transform(this.date, 'd'),
            frequency: this.selectedFrequency.value,
            dayOfWeek: this.selectedScheduleDay?.fullDay,
            scheduleTime:
                this.selectedFrequency.value === ScheduleFrequencyEnum.Weekly
                    ? this.datePipe.transform(this.selectedScheduleDay.time, 'YYYY-MM-dd HH:mm', 'UTC')
                    : this.datePipe.transform(this.date, 'YYYY-MM-dd HH:mm', 'UTC'),
            timeDisplay:
                this.selectedFrequency.value === ScheduleFrequencyEnum.Weekly
                    ? this.datePipe.transform(this.selectedScheduleDay.time, 'HH:mm')
                    : this.datePipe.transform(this.date, 'HH:mm'),
        };
    }
}
