import { TestBed } from '@angular/core/testing';

import { SpellcheckService } from './spellcheck.service';

describe('SpellCheckService', () => {
    let service: SpellcheckService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpellcheckService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
