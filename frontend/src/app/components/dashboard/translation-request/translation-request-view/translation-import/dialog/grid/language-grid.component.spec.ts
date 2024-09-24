import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageGridComponent } from './language-grid.component';

describe('GridComponent', () => {
    let component: LanguageGridComponent;
    let fixture: ComponentFixture<LanguageGridComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LanguageGridComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LanguageGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
