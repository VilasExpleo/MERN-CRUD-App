import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LanguageService } from './languages.service';
import { TreeNode } from 'primeng/api';
import { environment } from '../../../../environments/environment';

describe(' Unit test for LanguageService', () => {
    let service: LanguageService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LanguageService],
        });

        service = TestBed.inject(LanguageService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getLanguages', () => {
        it('should return an Observable<TreeNode[]>', () => {
            const mockLanguages: TreeNode[] = [
                { label: 'English', data: 'en' },
                { label: 'Deutsch', data: 'de' },
                { label: 'Español', data: 'es' },
                { label: 'Français', data: 'fr' },
            ];

            service.getLanguages().subscribe((languages) => {
                expect(languages).toEqual(mockLanguages);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}langdata`);
            req.flush({ data: mockLanguages });
        });

        it('should make a GET request', () => {
            service.getLanguages().subscribe();
            const req = httpMock.expectOne(`${environment.apiUrl}langdata`);
            req.flush(true);
            expect(req.request.method).toBe('GET');
        });
    });
});
