import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCreatorDashboardComponent } from './data-creator-dashboard.component';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { NgEventBus } from 'ng-event-bus';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { IgcDockManagerPaneType, IgcSplitPaneOrientation } from '@infragistics/igniteui-dockmanager';

describe('ReviewerDashboardComponent', () => {
    let component: DataCreatorDashboardComponent;
    let fixture: ComponentFixture<DataCreatorDashboardComponent>;
    let mockDashboardLayoutService: Spy<DashboardLayoutService>;
    let mockEventBus: Spy<NgEventBus>;

    beforeEach(async () => {
        mockDashboardLayoutService = createSpyFromClass(DashboardLayoutService);
        mockEventBus = createSpyFromClass(NgEventBus);

        mockEventBus.on.mockReturnValue(of({ data: 1 }));
        mockDashboardLayoutService.defaultLayout = {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [],
            },
        };

        await TestBed.configureTestingModule({
            declarations: [DataCreatorDashboardComponent],
            providers: [
                {
                    provide: DashboardLayoutService,
                    useValue: mockDashboardLayoutService,
                },
                {
                    provide: NgEventBus,
                    useValue: mockEventBus,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DataCreatorDashboardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit life cycle hook', () => {
        it('should create initial layout', () => {
            fixture.detectChanges();
            component.dockRawProjectsTitle = 'project 1';
            mockDashboardLayoutService.getDefaultLayout(component.dockRawProjectsTitle);
            expect(mockDashboardLayoutService.getDefaultLayout).toHaveBeenCalledWith('project 1');
        });

        it('should set dockRawProjectsTitle value', () => {
            fixture.detectChanges();
            mockEventBus.on('mockdata').subscribe(() => {
                expect(component.dockRawProjectsTitle).toBe('Projects: 1');
            });
        });
    });

    it('should call destroy hook when component destroyed', () => {
        jest.spyOn(component.destroyed$, 'next');
        fixture.destroy();
        expect(component.destroyed$.next).toBeCalledWith(true);
    });
});
