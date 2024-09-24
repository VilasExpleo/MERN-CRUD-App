import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTranslationManagerComponent } from './assign-translation-manager.component';

describe('AssignTranslationManagerComponent', () => {
    let component: AssignTranslationManagerComponent;
    let fixture: ComponentFixture<AssignTranslationManagerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignTranslationManagerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignTranslationManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
