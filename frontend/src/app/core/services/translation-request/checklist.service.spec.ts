import { TestBed } from '@angular/core/testing';

import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { ApiService } from '../api.service';
import { ChecklistService } from './checklist.service';

describe('ChecklistService', () => {
    let service: ChecklistService;
    let mockApiService: Spy<ApiService>;

    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        TestBed.configureTestingModule({
            declarations: [ChecklistService],
        });
        service = new ChecklistService(mockApiService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('checklist get and set', () => {
        it('should return an observable of checklist', () => {
            const mockChecklist = [{ check: 'upper case', isChecked: false }];
            const spy = jest.spyOn(service, 'setChecklist');
            service.setChecklist(mockChecklist);
            expect(spy).toHaveBeenCalled();
            let getChecklist;
            service.getChecklist().subscribe((checklist) => {
                getChecklist = checklist;
            });
            expect(getChecklist).toBe(mockChecklist);
        });
    });

    it('should call ApiService.patchTypeRequest with the correct arguments', async () => {
        // Arrange
        const mockPayload = {
            projectId: 4542,
            languageId: 100,
            translationRequestId: 864,
            check: [
                { checklistId: 44, check: 'Upper Case', isChecked: true },
                { checklistId: 45, check: 'Lower Case', isChecked: false },
                { checklistId: 46, check: 'Capitcal', isChecked: false },
            ],
        };
        const mockResponse = { status: 'OK', message: 'Checklist updated successfully' };
        mockApiService.patchTypeRequest.mockResolvedValue(mockResponse);
        const resultPromise = service.updateChecklist(mockPayload);
        expect(mockApiService.patchTypeRequest).toHaveBeenCalledWith('translator-dashboard/update-check', mockPayload);
        const response = await resultPromise;
        expect(response).toEqual(mockResponse);
    });
});
