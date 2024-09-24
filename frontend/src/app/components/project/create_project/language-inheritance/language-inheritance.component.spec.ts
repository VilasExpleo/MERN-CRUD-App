import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageInheritanceTreeComponent } from './language-inheritance.component';

describe('LanguageInheritanceComponent', () => {
    let component: LanguageInheritanceTreeComponent;
    let fixture: ComponentFixture<LanguageInheritanceTreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LanguageInheritanceTreeComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LanguageInheritanceTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
