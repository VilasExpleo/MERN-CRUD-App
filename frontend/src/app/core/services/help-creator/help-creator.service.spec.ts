import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { HelpCreatorDashboardTransformer } from 'src/app/components/dashboard/help-creator-dashboard/help-creator-dashboard.transformer';
import { HelpIndexTransformer } from 'src/app/components/dashboard/help-creator-dashboard/help-index/help-index.transformer';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';
import { HelpCreatorService } from './help-creator.service';

describe('HelpCreatorService', () => {
    let service: HelpCreatorService;
    let mockHelpCreatorTransformer: Spy<HelpIndexTransformer>;
    let mockUserService: Spy<UserService>;
    let mockApiService: Spy<ApiService>;
    let mockHelpCreatorDashboardTransformer: Spy<HelpCreatorDashboardTransformer>;
    let mockMessageService: Spy<MessageService>;

    const mockPagePayload = {
        pageId: 1,
        pageTitle: 'mock page title',
        parentPageId: 0,
        tags: [],
        links: [],
        formattedContent: '',
        userId: 1,
    };
    const mockPayloadPageProperty = {
        id: 1,
        ...mockPagePayload,
    };

    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        mockUserService = createSpyFromClass(UserService);
        mockHelpCreatorTransformer = createSpyFromClass(HelpIndexTransformer);
        mockHelpCreatorDashboardTransformer = createSpyFromClass(HelpCreatorDashboardTransformer);

        mockUserService.getUser.mockReturnValue({ id: 1 });
        mockApiService.postTypeRequest.mockReturnValue(
            of({ status: 'OK', message: 'mock-message', data: 'mock-data' })
        );

        service = new HelpCreatorService(
            mockUserService,
            mockApiService,
            mockHelpCreatorDashboardTransformer,
            mockMessageService,
            mockHelpCreatorTransformer
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    const mockResult = {
        status: ResponseStatusEnum.OK,
        message: 'ok',
        data: 'mock-data',
    };

    it('should return list of pages', () => {
        mockApiService.getRequest.mockReturnValue(of(mockResult));
        mockHelpCreatorTransformer.transform.mockReturnValue(of('mock-result-data'));
        service.getHelpSystemPages().subscribe((response) => {
            expect(response).toBe('mock-result-data');
        });
    });
    const mockRowProperties = {
        id: 1,
        pageId: 1,
        parentPageId: 1,
        pageTitle: 'mockpage',
        isChild: false,
        isEditMode: false,
        isSaved: false,
    };

    it('should update the page', () => {
        mockApiService.postTypeRequest.mockReturnValue(of(mockResult));
        service.addPage(mockRowProperties).subscribe((response) => {
            expect(response).toEqual(mockResult);
        });
    });
    it('should call the with payload', () => {
        const mockAddPage = jest.spyOn(service, 'addPage');
        service.addPage(mockRowProperties);
        mockApiService.postTypeRequest.mockReturnValue(of(mockResult));
        expect(mockAddPage).toHaveBeenCalledWith(mockRowProperties);
    });

    it('should update page with payload', () => {
        const mockUpdatePage = jest.spyOn(service, 'updatePage');
        const mockPatch = jest.spyOn(mockApiService, 'patchTypeRequest');
        mockApiService.patchTypeRequest.mockReturnValue(of(mockResult));
        service.updatePage(mockPagePayload);
        mockApiService.patchTypeRequest(`help-system/page/${mockPagePayload.pageId}/1`, mockPagePayload);
        expect(mockUpdatePage).toHaveBeenCalledWith(mockPagePayload);
        expect(mockPatch).toHaveBeenCalledWith('help-system/page/1/1', mockPagePayload);
    });

    it('should delete page', () => {
        mockApiService.deleteRequest.mockReturnValue(of({ status: 'OK', message: 'mock-delete' }));
        const mockDeletePageRequest = jest.spyOn(mockApiService, 'deleteRequest');
        service.deletePage(1, true);
        expect(mockDeletePageRequest).toHaveBeenCalledWith('help-system/page/1/true');
    });

    it('should return page details', () => {
        mockApiService.getRequest.mockReturnValue(of(mockResult));
        mockHelpCreatorDashboardTransformer.transform.mockReturnValue(of(mockPagePayload));
        service.getPage(mockPayloadPageProperty).subscribe((response) => expect(response).toBe(mockPagePayload));
    });

    it('should return number of links available', () => {
        const mockLinks = [
            {
                id: 1,
                linkName: 'link 1',
                linkId: 1,
                helpPageId: 1,
            },
        ];

        const mockTemplates = [
            {
                templateId: 1,
                templateName: 'Template 1',
            },
        ];

        const mockResult = {
            links: mockLinks,
            templates: mockTemplates,
        };
        mockApiService.getRequest.mockReturnValue(of(mockResult));
        service.getOptions().subscribe((response) => {
            expect(response).toEqual(mockResult);
        });
    });
});
