import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { HistoryService } from 'src/app/core/services/reports/history/history.service';
import { User } from 'src/app/shared/models/user';
import { ReportData } from 'src/app/shared/models/reports/report.data';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReportFilterPipe } from '../pipes/report-filter/report-filter.pipe';
import { of } from 'rxjs';

describe('HistoryComponent', () => {
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;
    let historyService: Spy<HistoryService>;

    beforeEach(() => {
        historyService = createSpyFromClass(HistoryService);
        TestBed.configureTestingModule({
            declarations: [HistoryComponent, ReportFilterPipe],
            imports: [HttpClientModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: HistoryService, useValue: historyService }],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load report history', () => {
        const user: User = {
            id: 1,
            name: '',
            role: 0,
            email: '',
            token: '',
            brandId: 0,
            brandName: '',
        };
        const reportData: ReportData = {
            projectDetails: { project_id: 123 },
            generateReportTitle: '',
            pageSource: '',
        };

        historyService.getReportsHistory.mockReturnValue(of([]));

        component.user = user;
        component.reportData = reportData;

        fixture.detectChanges();

        expect(historyService.getReportsHistory).toHaveBeenCalledWith({
            creatorId: user.id,
            projectId: reportData.projectDetails.project_id,
        });

        expect(component.isLoading).toBe(false);
        expect(component.historyList$.getValue()).toEqual([]);
    });
});
