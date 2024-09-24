import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { XmlProjectCreationService } from './xml-project-creation.service';

describe('XmlProjectCreationService', () => {
    let service: XmlProjectCreationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [XmlProjectCreationService],
        });
        service = TestBed.inject(XmlProjectCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
