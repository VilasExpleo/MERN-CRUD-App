import { TestBed } from '@angular/core/testing';

import { ProjectUpdateService } from './project-update.service';

describe('ProjectUpdateService', () => {
    let service: ProjectUpdateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectUpdateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
