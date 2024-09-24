import { TestBed } from '@angular/core/testing';

import { CompressDecompressService } from './compress-decompress.service';

describe('CompressDecomparessService', () => {
    let service: CompressDecompressService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CompressDecompressService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
