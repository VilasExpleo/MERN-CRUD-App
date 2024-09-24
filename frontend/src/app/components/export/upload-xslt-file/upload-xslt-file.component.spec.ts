import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadXsltFileComponent } from './upload-xslt-file.component';

describe('UploadXsltFileComponent', () => {
    let component: UploadXsltFileComponent;
    let fixture: ComponentFixture<UploadXsltFileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UploadXsltFileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadXsltFileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
