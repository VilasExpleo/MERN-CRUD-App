import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcHeaderComponent } from './stc-header.component';

describe('StcHeaderComponent', () => {
    let component: StcHeaderComponent;
    let fixture: ComponentFixture<StcHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcHeaderComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
