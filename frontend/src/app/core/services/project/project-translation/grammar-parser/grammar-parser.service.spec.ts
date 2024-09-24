import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { SocketService } from 'src/app/shared/websocket/socket.service';
import { TranslationCheckService } from '../../../check/translation-check.service';
import { ProjectTranslationService } from '../project-translation.service';
import { GrammarParserService } from './grammar-parser.service';
import { LocalStorageService } from '../../../storage/local-storage.service';
import { CompressDecompressService } from './compress-decompress.service';

describe('GrammarParserService', () => {
    let service: GrammarParserService;
    let mockTranslationService: Spy<TranslationCheckService>;
    let mockProjectTranslationService: Spy<ProjectTranslationService>;
    let mockCompressDecompressService: Spy<CompressDecompressService>;
    let mockLocalStorageService: Spy<LocalStorageService>;
    let mockSocketService: SocketService;

    beforeEach(() => {
        mockProjectTranslationService = createSpyFromClass(ProjectTranslationService);
        mockLocalStorageService = createSpyFromClass(LocalStorageService);

        mockLocalStorageService.get.mockReturnValue('{"gpConfigIds": [12] }');
        mockSocketService = new SocketService();
        service = new GrammarParserService(
            mockSocketService,
            mockTranslationService,
            mockProjectTranslationService,
            mockCompressDecompressService,
            mockLocalStorageService
        );
    });

    afterEach(() => {
        mockSocketService.disconnectSocket();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect to socket on connection', () => {
        const mockConnect = jest.spyOn(mockSocketService.socket, 'connect');
        mockSocketService.socket.connect();
        expect(mockConnect).toHaveBeenCalled();
    });

    it('should set up connection', () => {
        const mockEmit = jest.spyOn(mockSocketService.socket, 'emit');
        service.initializeGrammarParser();
        expect(mockEmit).toBeCalledWith('setup', { gpConfigIds: [12] });
    });

    it('should it should check for grammar', () => {
        const grammarMockRequest = {
            dbTextNodeId: 1,
            textNodeType: 'mockType',
            sourceText: 'mockText',
            translationText: 'mockTranslationText',
        };
        const mockEmit = jest.spyOn(mockSocketService.socket, 'emit');
        service.grammarParserCheckEvent(grammarMockRequest);
        expect(mockEmit).toBeCalledWith('grammar-check', grammarMockRequest);
    });

    it('should disconnect', () => {
        const mockDisconnect = jest.spyOn(mockSocketService.socket, 'disconnect');
        mockSocketService.socket.disconnect();
        expect(mockDisconnect).toHaveBeenCalled();
    });
});
