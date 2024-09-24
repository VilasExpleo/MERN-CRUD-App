import { TestBed } from '@angular/core/testing';

import { StcActionService } from './stc-action.service';

describe('StcActionService', () => {
    let service: StcActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StcActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
