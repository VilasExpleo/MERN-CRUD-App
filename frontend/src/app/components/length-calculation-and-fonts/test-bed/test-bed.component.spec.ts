import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { ApiLengthCalculationService } from 'src/app/core/services/apiLengthCalculation.service';
import { LengthCalculationService } from 'src/app/core/services/length-calculation-and-fonts/length-calculation.service';
import { TestBedComponent } from './test-bed.component';
import { TestBedTransformer } from './test-bed.transformer';

describe('TestBedComponent', () => {
    let component: TestBedComponent;
    let fixture: ComponentFixture<TestBedComponent>;
    let mockLengthCalculationService: Spy<LengthCalculationService>;
    let mockDialogService: Spy<DialogService>;
    let mockApiService: Spy<ApiService>;
    let mockFb: Spy<FormBuilder>;
    let mockMessageService: Spy<MessageService>;
    let mockConfirmationService: Spy<ConfirmationService>;
    let mockApiLengthCalculationService: Spy<ApiLengthCalculationService>;
    let mockTestBedTransformer: Spy<TestBedTransformer>;

    const lcData = {
        defaultFont: {
            fontName: 'FreeSans',
            fontPath: 'C:/HMIL/uploads/fonts/default-fonts',
            fontSize: 12,
            fontType: 'TrueType',
        },
        columns: [
            {
                header: 'Sample Text',
                field: 'sampleText',
            },
        ],
        rows: [],
    };

    beforeEach(async () => {
        mockLengthCalculationService = createSpyFromClass(LengthCalculationService);
        mockDialogService = createSpyFromClass(DialogService);
        mockApiService = createSpyFromClass(ApiService);
        mockFb = createSpyFromClass(FormBuilder);
        mockMessageService = createSpyFromClass(MessageService);
        mockConfirmationService = createSpyFromClass(ConfirmationService);
        mockApiLengthCalculationService = createSpyFromClass(ApiLengthCalculationService);
        mockTestBedTransformer = createSpyFromClass(TestBedTransformer);

        mockLengthCalculationService.getAvailableLC.mockReturnValue(of('mock-lcs'));
        mockLengthCalculationService.getTestBedConfiguration.mockReturnValue(of(lcData));
        mockLengthCalculationService.availableLC = [];
        mockLengthCalculationService.getCalculatedMessage.mockReturnValue(
            of({
                type: 'calculateWidthForTestbed-server',
                content: [
                    {
                        lcName: 'Example-Vx.y.z',
                        text: 'Automatic Emergency Braking ⚠',
                        width: 0,
                        error: ['⚠'],
                        errorType: 'Unresolved chars',
                    },
                ],
            })
        );

        await TestBed.configureTestingModule({
            declarations: [TestBedComponent],
            providers: [
                { provide: LengthCalculationService, useValue: mockLengthCalculationService },
                { provide: DialogService, useValue: mockDialogService },
                { provide: ApiService, useValue: mockApiService },
                { provide: FormBuilder, useValue: mockFb },
                { provide: MessageService, useValue: mockMessageService },
                { provide: ConfirmationService, useValue: mockConfirmationService },
                { provide: ApiLengthCalculationService, useValue: mockApiLengthCalculationService },
                { provide: TestBedTransformer, useValue: mockTestBedTransformer },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TestBedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return at least one value after getAvailableLC', () => {
        mockLengthCalculationService.availableLC = mockData;
        const data = component.getAvailableLC();
        expect(data).toEqual(expectedData);
    });

    const mockData = [{ lc_name: 'mockName', lc_version: 'xyz', lc_path: 'mockPath' }];
    const expectedData = [{ lcName: 'mockName-Vxyz', lcPath: 'mockPath' }];
    describe('ngOnInIt lifecycle method', () => {
        it('should call getAvailableLC  on length calculation service to get available LCs', () => {
            expect(mockLengthCalculationService.getAvailableLC).toHaveBeenCalled();
            mockLengthCalculationService.availableLC.push(mockData);
            expect(mockLengthCalculationService.availableLC.length).toBeGreaterThanOrEqual(1);
        });

        it('should call getAvailableLC with url parameter', () => {
            mockLengthCalculationService.getAvailableLC('mock-url');
            expect(mockLengthCalculationService.getAvailableLC).toHaveBeenCalledWith('mock-url');
        });

        it('should call getTestBedConfiguration on length calculation service to get testbed configuration', () => {
            expect(mockLengthCalculationService.getTestBedConfiguration).toHaveBeenCalled();
        });
    });

    describe('On select method', () => {
        it('should update column and rows on select method called', () => {
            const spyOnSelect = jest.spyOn(component, 'onSelect');
            component.onSelect(expectedData);
            expect(spyOnSelect).toHaveBeenCalledWith(expectedData);
        });
        it('should push value to column after on select method called', () => {
            const mockLcDropDownValue = [{ lcName: 'mockName-Vabc', lcPath: 'mockPath' }];
            component.onSelect([...expectedData, ...mockLcDropDownValue]);
            expect(component.model.columns.length).toBe(3);
        });

        it('should remove the column if new LC is not present in the existing column', () => {
            component.onSelect(expectedData);
            expect(component.model.columns.length).toBe(2);
        });
        it('should have one column if empty value is passed', () => {
            component.onSelect([]);
            expect(component.model.columns.length).toBe(1);
        });
    });

    describe('Add row with text box method', () => {
        it('should call addRowWithTextBox', () => {
            const initialRowCount = component.model.rows.length;
            const spyAddRowWithTextBox = jest.spyOn(component, 'addRowWithTextBox');
            component.addRowWithTextBox();

            expect(spyAddRowWithTextBox).toHaveBeenCalled();
            expect(component.model.rows.length).toBe(initialRowCount + 1);
            const addedRow = component.model.rows[initialRowCount];
            expect(addedRow.sampleText).toBe('');
            expect(addedRow.id).toBe(initialRowCount);
            expect(addedRow.customText).toBe(true);
        });
    });

    describe('Check for error after calculation methods', () => {
        it('should calculateLengthForCustomText', () => {
            const spyCalculateLengthForCustomText = jest.spyOn(component, 'calculateLengthForCustomText');
            component.calculateLengthForCustomText('mock-value');
            expect(spyCalculateLengthForCustomText).toHaveBeenCalledWith('mock-value');
        });
        it('should check isTextHasError returns false', () => {
            const rowData = {
                sampleText: '',
                id: 0,
                customText: true,
            };

            const col = {
                field: 'sampleText',
                header: 'Sample Text',
            };

            const isTextHasError = component.isTextHasError(rowData, col);
            expect(isTextHasError).toBe(false);
        });

        it('should check isTextHasError returns true', () => {
            const rowData = {
                sampleText: 'Unresolved',
                id: 0,
                customText: true,
            };

            const col = {
                field: 'sampleText',
                header: 'Sample Text',
            };

            const isTextHasError = component.isTextHasError(rowData, col);
            expect(isTextHasError).toBe(true);
        });
        it('should check isColumnNotSampleText returns false', () => {
            const rowData = {
                sampleText: '',
                id: 0,
            };

            const col = {
                field: 'sampleText',
                header: 'Sample Text',
            };

            const isTextHasError = component.isColumnNotSampleText(rowData, col);
            expect(isTextHasError).toBe(true);
        });
        it('should check isColumnNotSampleText returns true', () => {
            const rowData = {
                sampleText: '',
                id: 0,
            };

            const col = {
                field: 'column',
                header: 'Column',
            };

            const isTextHasError = component.isColumnNotSampleText(rowData, col);
            expect(isTextHasError).toBe(true);
        });
    });

    describe('Delete row method', () => {
        it('should delete row', () => {
            component.model.rows = [{ sampleText: 'mockText', id: 1 }];
            component.selectedRow = { sampleText: 'mockText', id: 1 };
            component.delete();

            expect(component.model.rows).toHaveLength(0);
        });
    });
});
