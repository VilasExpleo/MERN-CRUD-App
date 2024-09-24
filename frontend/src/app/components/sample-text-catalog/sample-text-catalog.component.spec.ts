import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleTextCatalogComponent } from './sample-text-catalog.component';

describe('SampleTextCatalogComponent', () => {
    let component: SampleTextCatalogComponent;
    let fixture: ComponentFixture<SampleTextCatalogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SampleTextCatalogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SampleTextCatalogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
