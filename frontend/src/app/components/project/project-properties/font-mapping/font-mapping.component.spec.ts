import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontMappingComponent } from './font-mapping.component';

describe('FontMappingComponent', () => {
    let component: FontMappingComponent;
    let fixture: ComponentFixture<FontMappingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FontMappingComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FontMappingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
