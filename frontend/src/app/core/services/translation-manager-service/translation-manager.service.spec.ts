import { TestBed } from '@angular/core/testing';

import { TranslationManagerService } from './translation-manager.service';

describe('TranslationManagerService', () => {
    let service: TranslationManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TranslationManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
