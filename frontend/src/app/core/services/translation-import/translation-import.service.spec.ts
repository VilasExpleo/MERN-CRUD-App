import { TestBed } from '@angular/core/testing';

import { TranslationImportService } from './translation-import.service';

describe('TranslationImportService', () => {
    let service: TranslationImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TranslationImportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
