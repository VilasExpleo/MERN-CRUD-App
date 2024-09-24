import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStcComponent } from './create-stc.component';

describe('CreateStcComponent', () => {
    let component: CreateStcComponent;
    let fixture: ComponentFixture<CreateStcComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateStcComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateStcComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
