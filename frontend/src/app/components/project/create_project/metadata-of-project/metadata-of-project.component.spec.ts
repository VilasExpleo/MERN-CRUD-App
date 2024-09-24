import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataOfProjectComponent } from './metadata-of-project.component';

describe('MetadataOfProjectComponent', () => {
    let component: MetadataOfProjectComponent;
    let fixture: ComponentFixture<MetadataOfProjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MetadataOfProjectComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MetadataOfProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
