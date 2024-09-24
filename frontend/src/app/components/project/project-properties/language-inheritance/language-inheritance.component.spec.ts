import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageInheritanceComponent } from './language-inheritance.component';

describe('LanguageInheritanceComponent', () => {
    let component: LanguageInheritanceComponent;
    let fixture: ComponentFixture<LanguageInheritanceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LanguageInheritanceComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LanguageInheritanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
