import { TestBed } from '@angular/core/testing';

import { UploadxmlService } from './uploadxml.service';

describe('UploadxmlService', () => {
    let service: UploadxmlService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UploadxmlService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
