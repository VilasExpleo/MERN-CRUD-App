import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RawProjectGridComponent } from './raw-project-grid.component';

describe('ReviewerDashboardComponent', () => {
    let component: RawProjectGridComponent;
    let fixture: ComponentFixture<RawProjectGridComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RawProjectGridComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RawProjectGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
