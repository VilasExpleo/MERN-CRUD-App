import { TestBed } from '@angular/core/testing';

import { WorkbookService } from './workbook.service';

describe('WorkbookServiceService', () => {
    let service: WorkbookService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WorkbookService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
