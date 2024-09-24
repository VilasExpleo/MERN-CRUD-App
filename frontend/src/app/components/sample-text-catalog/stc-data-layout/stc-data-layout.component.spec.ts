import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcDataLayoutComponent } from './stc-data-layout.component';

describe('StcDataLayoutComponent', () => {
    let component: StcDataLayoutComponent;
    let fixture: ComponentFixture<StcDataLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcDataLayoutComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcDataLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
