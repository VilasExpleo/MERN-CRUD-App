import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createSpyFromClass, Spy } from 'jest-auto-spies';
import { of } from 'rxjs';
import { SpellcheckService } from 'src/app/core/services/spellcheck/spellcheck.service';
import { SpellcheckComponent } from './spellcheck.component';
import { SpellcheckModel } from './spellcheck.model';

describe('SpellcheckComponent', () => {
    let component: SpellcheckComponent;
    let fixture: ComponentFixture<SpellcheckComponent>;
    let mockSpellcheckService: Spy<SpellcheckService>;

    const spellcheckData = {
        currentVersion: 1,
        latestVersion: 1,
        spellChecker: 'Nodehun',
    };

    beforeEach(async () => {
        mockSpellcheckService = createSpyFromClass(SpellcheckService);
        mockSpellcheckService.getSpellcheckVersion.mockReturnValue(of(spellcheckData));
        await TestBed.configureTestingModule({
            declarations: [SpellcheckComponent],
            providers: [{ provide: SpellcheckService, useValue: mockSpellcheckService }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(SpellcheckComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct version update text', () => {
        component.spellcheck = { spellchecker: 'MockSpellchecker' } as SpellcheckModel;
        const result = component.versionUpdateText();
        expect(result).toBe('A new MockSpellchecker update is available! Please contact your system operator.');
    });
});
