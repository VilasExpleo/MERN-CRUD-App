import { TestBed } from '@angular/core/testing';

import { TranslationImportReportService } from './translation-import-report.service';

describe('TranslationImportReportService', () => {
    let service: TranslationImportReportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TranslationImportReportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
