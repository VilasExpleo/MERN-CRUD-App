import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTranslationComponent } from './header-translation.component';

describe('HeaderTranslationComponent', () => {
    let component: HeaderTranslationComponent;
    let fixture: ComponentFixture<HeaderTranslationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HeaderTranslationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderTranslationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
