import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLanguagesComponent } from './import-languages.component';

describe('ImportLanguagesComponent', () => {
    let component: ImportLanguagesComponent;
    let fixture: ComponentFixture<ImportLanguagesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImportLanguagesComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportLanguagesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
