import { createSpyFromClass } from 'jest-auto-spies';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HistoryService } from './history.service';
import { ApiService } from '../../api.service';
import { HistoryTransformer } from 'src/app/components/Reports/project-report/history/history.transformer';
import { ReportHistoryRequestModel } from '../../../../shared/models/reports/report-history.request.model';

describe('HistoryService', () => {
    let service: HistoryService;
    const apiServiceMock = createSpyFromClass(ApiService);
    const historyTransformerMock = createSpyFromClass(HistoryTransformer);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                HistoryService,
                { provide: ApiService, useValue: apiServiceMock },
                { provide: HistoryTransformer, useValue: historyTransformerMock },
            ],
        });
        service = TestBed.inject(HistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getReportsHistory', () => {
        it('should call ApiService.getRequest and HistoryTransformer.transform', () => {
            const payload: ReportHistoryRequestModel = { projectId: 1, creatorId: 2 };

            const responseMock = { data: {} };
            const transformedDataMock = [
                {
                    data: 'mock-data',
                },
            ];

            apiServiceMock.getRequest.mockReturnValue(of(responseMock));
            historyTransformerMock.transform.mockReturnValue(transformedDataMock);

            service.getReportsHistory(payload).subscribe((result) => {
                expect(apiServiceMock.getRequest).toHaveBeenCalledWith(
                    `report/history/${payload.projectId}/${payload.creatorId}`
                );
                expect(historyTransformerMock.transform).toHaveBeenCalledWith(responseMock);
                expect(result).toEqual(transformedDataMock);
            });
        });

        it('should handle errors and return an empty array', () => {
            const payload: ReportHistoryRequestModel = { projectId: 1, creatorId: 2 };

            apiServiceMock.getRequest.mockReturnValue(of(null));

            service.getReportsHistory(payload).subscribe((result) => {
                expect(apiServiceMock.getRequest).toHaveBeenCalledWith(
                    `report/history/${payload.projectId}/${payload.creatorId}`
                );
                expect(result).toEqual([]);
            });
        });
    });

    describe('deleteReportHistory', () => {
        it('should call ApiService.deleteRequest', () => {
            const reportHistoryId = 123;

            apiServiceMock.deleteRequest.mockReturnValue(of({}));

            service.deleteReportHistory(reportHistoryId).subscribe(() => {
                expect(apiServiceMock.deleteRequest).toHaveBeenCalledWith(`report/history/${reportHistoryId}`);
            });
        });
    });
});
