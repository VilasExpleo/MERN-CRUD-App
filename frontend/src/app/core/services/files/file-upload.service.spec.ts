import { TestBed } from '@angular/core/testing';

import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
    let service: FileUploadService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FileUploadService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('test calculateFileSize method for different cases', () => {
        it('should return "0 B" for null case', () => {
            expect(service.calculateFileSize(null)).toBe('0.00 B');
        });

        it('should return "0 B" for size 0', () => {
            expect(service.calculateFileSize(0)).toEqual('0.00 B');
        });

        it('should return "100 B" for size 100', () => {
            expect(service.calculateFileSize(100)).toBe('100.00 B');
        });

        it('should return "1 KB" for size 1024', () => {
            expect(service.calculateFileSize(1024)).toEqual('1.00 KB');
        });

        it('should return "1 MB" for size 1048576', () => {
            expect(service.calculateFileSize(1048576)).toEqual('1.00 MB');
        });

        it('should return "1 GB" for size 1073741824', () => {
            expect(service.calculateFileSize(1073741824)).toEqual('1.00 GB');
        });
        it('should return "1 TB" for size 1099511627776', () => {
            expect(service.calculateFileSize(1099511627776)).toBe('1.00 TB');
        });
        it('should return "1 PB" for size 1125899906842624', () => {
            expect(service.calculateFileSize(1125899906842624)).toBe('1.00 PB');
        });
    });
});
