import { TestBed } from '@angular/core/testing';

import { SampleXmlService } from './sample-xml.service';

describe('SampleXmlService', () => {
    let service: SampleXmlService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SampleXmlService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
