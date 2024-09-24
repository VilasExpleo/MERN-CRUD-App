import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { LcAndFontsComponent } from './lc-and-fonts.component';

describe('LcAndFontsComponent', () => {
    let component: LcAndFontsComponent;
    let fixture: ComponentFixture<LcAndFontsComponent>;
    let mockProjectService: Spy<ProjectService>;
    let mockFormBuilder: Spy<FormBuilder>;

    beforeEach(async () => {
        mockFormBuilder = createSpyFromClass(FormBuilder);
        mockProjectService = createSpyFromClass(ProjectService);
        mockProjectService.lengthCalculationIds = [1];

        mockProjectService.getFontList.mockReturnValue(of({ data: [{ font_version: 1 }] }));
        mockProjectService.getRole.mockReturnValue(of({ data: [{ id: 1 }] }));
        mockProjectService.getLengthCalculationsList.mockReturnValue(
            of({ data: [{ lc_name: 'lc', lc_version: '1.0' }] })
        );
        mockProjectService.getLcAndFontState.mockReturnValue(
            of({ defaultLengthCalculationsOfVectorFonts: [1], defaultFontPackages: 6, translationRole: 1 })
        );

        await TestBed.configureTestingModule({
            declarations: [LcAndFontsComponent],
            providers: [
                {
                    provide: FormBuilder,
                    useValue: mockFormBuilder,
                },
                {
                    provide: ProjectService,
                    useValue: mockProjectService,
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LcAndFontsComponent);
        component = fixture.componentInstance;
        component.metadataOfProjectForm = new FormGroup({
            defaultLengthCalculationsOfVectorFonts: new FormControl([]),
            defaultFontPackages: new FormControl(null),
            translationRole: new FormControl(null),
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form', () => {
        expect(component.metadataOfProjectForm).toBeTruthy();
    });

    it('should update meta data', () => {
        expect(component.metadataOfProjectForm.get('defaultLengthCalculationsOfVectorFonts').value.length).toBe(1);
    });

    it('should set the value for font', () => {
        expect(component.fontOption.length).toBe(1);
    });

    it('should set translation role data', () => {
        expect(component.translationRole.length).toBe(1);
    });
    it('should set Length calculation data', () => {
        expect(component.lcOption.length).toBe(1);
    });

    it('should set font selected as true', () => {
        expect(component.isFontSelected).toBe(true);
    });

    it('should set length calculation as valid', () => {
        expect(component.isLengthCalculationValid()).toBe(true);
    });
});
