import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { HelpCreatorService } from 'src/app/core/services/help-creator/help-creator.service';
import { HelpPageComponent } from './help-page.component';

describe('HelpPageComponent', () => {
    let component: HelpPageComponent;
    let fixture: ComponentFixture<HelpPageComponent>;
    let mockHelpCreatorService: Spy<HelpCreatorService>;

    const mockLinks = [
        {
            id: 1,
            linkName: 'link 1',
            linkId: 1,
            helpPageId: 1,
        },
        {
            id: 2,
            linkName: 'link 2',
            linkId: 2,
            helpPageId: 2,
        },
    ];

    const mockTemplates = [
        {
            templateId: 1,
            templateName: 'Template 1',
        },
    ];

    const mockResult = {
        links: mockLinks,
        templates: mockTemplates,
    };

    beforeEach(async () => {
        mockHelpCreatorService = createSpyFromClass(HelpCreatorService);

        mockHelpCreatorService.getOptions.mockReturnValue(of(mockResult));
        await TestBed.configureTestingModule({
            declarations: [HelpPageComponent],
            providers: [
                {
                    provide: HelpCreatorService,
                    useValue: mockHelpCreatorService,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(HelpPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.tags = ['mock tag 1'];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit life cycle hook', () => {
        it('should create formGroup', () => {
            expect(component.helpPageForm).toBeTruthy();
        });

        it('should have links on load', () => {
            expect(component.links.length).toBe(2);
        });
    });

    describe('should add tag on addTag', () => {
        it('should add a tag into tags array on addTag', () => {
            component.addTag('mock tag');
            expect(component.tags.length).toBe(2);
        });

        it('should set tags to form', () => {
            component.addTag('mock tag');
            expect(component.helpPageForm.get('tags').value.length).toBe(2);
        });
    });

    it('should return number of tags', () => {
        component.addTag('mock tag');
        const tags = component.getTags();
        expect(tags.length).toBe(2);
    });

    it('should delete the tags on deleteTags', () => {
        component.deleteTag(0);
        expect(component.tags.length).toBe(0);
        expect(component.getTags().length).toBe(0);
    });

    it('should emit submit payload', () => {
        const mockPayload = {
            pageId: 1,
            pageTitle: 'mock page title',
            parentPageId: 0,
            tags: [],
            links: [],
            formattedContent: '',
        };
        const mockSavePageEvent = jest.spyOn(component.savePageContentEvent, 'emit');
        component.savePageContentEvent.emit(mockPayload);

        expect(mockSavePageEvent).toHaveBeenCalledWith(mockPayload);
    });
});
