import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateRawProjectComponent } from './create-raw-project.component';

describe('CreateRawProjectComponent', () => {
    let component: CreateRawProjectComponent;
    let fixture: ComponentFixture<CreateRawProjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateRawProjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateRawProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
