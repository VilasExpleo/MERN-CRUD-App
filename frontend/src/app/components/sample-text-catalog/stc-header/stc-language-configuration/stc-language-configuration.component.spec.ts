import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcLanguageConfigurationComponent } from './stc-language-configuration.component';

describe('StcLanguageConfigurationComponent', () => {
    let component: StcLanguageConfigurationComponent;
    let fixture: ComponentFixture<StcLanguageConfigurationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcLanguageConfigurationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcLanguageConfigurationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
