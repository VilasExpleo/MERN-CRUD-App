import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignTranslationManagerComponent } from './reassign-translation-manager.component';

describe('ReassignTranslationManagerComponent', () => {
    let component: ReassignTranslationManagerComponent;
    let fixture: ComponentFixture<ReassignTranslationManagerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReassignTranslationManagerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReassignTranslationManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
