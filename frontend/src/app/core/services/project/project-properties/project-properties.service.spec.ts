import { TestBed } from '@angular/core/testing';

import { ProjectPropertiesService } from './project-properties.service';

describe('ProjectPropertiesService', () => {
    let service: ProjectPropertiesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectPropertiesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
