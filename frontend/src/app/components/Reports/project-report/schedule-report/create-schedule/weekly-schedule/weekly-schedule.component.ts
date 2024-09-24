import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ScheduleDaysModel } from '../schedule-days.model';
@Component({
    selector: 'app-weekly-schedule',
    templateUrl: './weekly-schedule.component.html',
})
export class WeeklyScheduleComponent implements OnInit {
    @Input()
    date: Date;

    @Input()
    minDateValue: Date;

    @Input()
    scheduleDays: ScheduleDaysModel[];

    @Input()
    dayOfWeek: string;

    @Output()
    selectDay = new EventEmitter<ScheduleDaysModel>();

    selectedScheduleDay: ScheduleDaysModel;

    ngOnInit(): void {
        this.selectedScheduleDay = {
            day: 'Sun',
            fullDay: 'Sunday',
            isSelected: false,
            time: this.date,
        };
        if (this.dayOfWeek) {
            const scheduleDay = this.scheduleDays.find((day) => day.fullDay === this.dayOfWeek);
            scheduleDay.isSelected = true;
            this.selectedScheduleDay.day = scheduleDay.day;
            this.selectedScheduleDay.fullDay = scheduleDay.fullDay;
            this.selectedScheduleDay.isSelected = scheduleDay.isSelected;
        }
    }

    selectWeek(scheduleDays: ScheduleDaysModel) {
        this.selectedScheduleDay.time = this.date;
        this.selectedScheduleDay.day = scheduleDays.day;
        this.selectedScheduleDay.fullDay = scheduleDays.fullDay;
        this.selectedScheduleDay.isSelected = true;
        this.selectDay.emit(this.selectedScheduleDay);
    }

    onBlurMethod() {
        this.selectedScheduleDay.time = this.date;
        this.selectDay.emit(this.selectedScheduleDay);
    }
}
