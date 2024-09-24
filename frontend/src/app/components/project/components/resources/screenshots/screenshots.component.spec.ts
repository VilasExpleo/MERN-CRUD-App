import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ResourceService } from 'src/app/core/services/resource/resource.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ScreenshotsComponent } from './screenshots.component';
import { of } from 'rxjs';

describe('ScreenshotsComponent', () => {
    let component: ScreenshotsComponent;
    let fixture: ComponentFixture<ScreenshotsComponent>;
    let mockFileUploadService: Spy<FileUploadService>;
    let mockProjectService: Spy<ProjectService>;
    let mockUserService: Spy<UserService>;
    let mockResourceService: Spy<ResourceService>;

    beforeEach(async () => {
        mockFileUploadService = createSpyFromClass(FileUploadService);
        mockProjectService = createSpyFromClass(ProjectService);
        mockUserService = createSpyFromClass(UserService);
        mockResourceService = createSpyFromClass(ResourceService);

        mockUserService.getUser.mockReturnValue({ role: 1 });
        mockProjectService.getScreenShotState.mockReturnValue(
            of({ screenShotFile: new Blob(), screenshotUploadState: 0 })
        );
        mockFileUploadService.calculateFileSize.mockReturnValue('50kb');

        await TestBed.configureTestingModule({
            declarations: [ScreenshotsComponent],
            providers: [
                {
                    provide: FileUploadService,
                    useValue: mockFileUploadService,
                },
                {
                    provide: ProjectService,
                    useValue: mockProjectService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: ResourceService,
                    useValue: mockResourceService,
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ScreenshotsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set file upload and progress state', () => {
        expect(component.fileUploaded).toBe(true);
        expect(component.fileUploadInProgress).toBe(false);
    });

    it('should set resource state on file upload', () => {
        const mockFile = { files: [new Blob(['mockFile'])] };
        component.onScreenshotsSelected(mockFile);
        const mockResource = {
            data: {
                file: new Blob(['mockFile']),
                userRole: 'editor',
            },
        };
        expect(component.fileUploaded).toBe(false);
        expect(mockResourceService.setResourceState).toHaveBeenCalledWith(mockResource);
    });

    it('should remove screen shot on remove', () => {
        component.removeScreenshotsFile();
        expect(component.isScreenshotsFileSelected).toBe(false);
    });

    it('should get file size', () => {
        expect(component.getFileSize(1234.56)).toBe('50kb');
    });
});
