import { TestBed } from '@angular/core/testing';

import { TableOperationService } from './table-operation.service';

describe('TableOperationService', () => {
    let service: TableOperationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TableOperationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
