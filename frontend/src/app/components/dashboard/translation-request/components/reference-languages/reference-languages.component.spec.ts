import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceLanguagesComponent } from './reference-languages.component';

describe('ReferenceLanguagesComponent', () => {
    let component: ReferenceLanguagesComponent;
    let fixture: ComponentFixture<ReferenceLanguagesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReferenceLanguagesComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReferenceLanguagesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
