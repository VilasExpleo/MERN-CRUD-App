import { TestBed } from '@angular/core/testing';

import { LayoutconfigurationService } from './layoutconfiguration.service';

describe('LayoutconfigurationService', () => {
    let service: LayoutconfigurationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LayoutconfigurationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
