import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepareProjectComponent } from './prepare-project.component';

describe('PrepareProjectComponent', () => {
    let component: PrepareProjectComponent;
    let fixture: ComponentFixture<PrepareProjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PrepareProjectComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PrepareProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
