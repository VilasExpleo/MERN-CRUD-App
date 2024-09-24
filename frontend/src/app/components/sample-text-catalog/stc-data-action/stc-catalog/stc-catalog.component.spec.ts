import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcCatalogComponent } from './stc-catalog.component';

describe('StcCatalogComponent', () => {
    let component: StcCatalogComponent;
    let fixture: ComponentFixture<StcCatalogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcCatalogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcCatalogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
