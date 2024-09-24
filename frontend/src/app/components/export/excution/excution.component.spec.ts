import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcutionComponent } from './excution.component';

describe('ExcutionComponent', () => {
    let component: ExcutionComponent;
    let fixture: ComponentFixture<ExcutionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExcutionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExcutionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
