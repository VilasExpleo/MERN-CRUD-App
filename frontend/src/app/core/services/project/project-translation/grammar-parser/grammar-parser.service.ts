import { Injectable } from '@angular/core';
import { TranslationCheck, TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import { TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';
import { GrammarParserSocketRequestModel } from 'src/app/shared/models/grammar-parser/grammar-parser-request.model';
import { GrammarParserSocketResponseModel } from 'src/app/shared/models/grammar-parser/grammar-parser-response.model';
import { SocketService } from 'src/app/shared/websocket/socket.service';
import { TranslationCheckService } from '../../../check/translation-check.service';
import { ProjectTranslationService } from '../project-translation.service';
import { GetUtteranceRequestModel } from 'src/app/shared/models/grammar-parser/get-utterances-request.model';
import { GetUtteranceResponseModel } from 'src/app/shared/models/grammar-parser/get-utterances-response.model';
import { CompressDecompressService } from './compress-decompress.service';
import { LocalStorageService } from '../../../storage/local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class GrammarParserService {
    constructor(
        private readonly socketService: SocketService,
        private readonly translationCheckService: TranslationCheckService,
        private readonly projectTranslationService: ProjectTranslationService,
        private readonly compressDecompressService: CompressDecompressService,
        private readonly localStorageService: LocalStorageService
    ) {}

    connectSocket(): void {
        this.socketService.connectSocket();
    }

    grammarParserCheckEvent(value: GrammarParserSocketRequestModel): void {
        this.socketService.socket.emit('grammar-check', value);
    }

    initializeGrammarParser(): void {
        const gpConfigIds = JSON.parse(this.localStorageService.get('projectProps'))?.gpConfigIds ?? [];
        this.socketService.socket.emit('setup', { gpConfigIds });
        this.handleGrammarErrorAndWarnings();
    }

    handleGrammarParserCheck(): void {
        this.projectTranslationService.isTextTypeSdsPromptOrCommand() &&
            this.projectTranslationService.isContextMenuVisible &&
            this.grammarParserCheckEvent(this.handleGrammarParserValidation());
    }

    private handleGrammarErrorAndWarnings(): void {
        this.socketService.socket.on('grammar-check', (response: GrammarParserSocketResponseModel) => {
            this.handleGrammarCheckResponse(response);
        });
    }

    private handleGrammarParserValidation(): GrammarParserSocketRequestModel {
        return {
            dbTextNodeId: this.projectTranslationService.projectData.dbTextNodeId,
            textNodeType: this.projectTranslationService.getTextNodeType(),
            sourceText: this.projectTranslationService.getSourceText(),
            translationText: this.projectTranslationService.translationText,
        };
    }

    private handleGrammarCheckResponse(response: GrammarParserSocketResponseModel): void {
        const standardWarningCheck = this.handleCreateGrammarLogs(
            response?.standardCheck?.warnings,
            TranslationCheckType.Warning
        );
        const translationWarningCheck = this.handleCreateGrammarLogs(
            response?.translationChecks?.warnings,
            TranslationCheckType.Warning
        );
        const standardErrorCheck = this.handleCreateGrammarLogs(
            response?.standardCheck?.errors,
            TranslationCheckType.Error
        );
        const translationErrorCheck = this.handleCreateGrammarLogs(
            response?.translationChecks?.errors,
            TranslationCheckType.Error
        );
        this.translationCheckService.setGrammarChecks([
            ...standardErrorCheck,
            ...standardWarningCheck,
            ...translationWarningCheck,
            ...translationErrorCheck,
        ]);
        this.compressDecompressService.setErrorState([...standardErrorCheck]);
    }

    private handleCreateGrammarLogs(issueLogs: string[], logLevel: TranslationCheckType): TranslationCheckModel[] {
        return (
            issueLogs?.map((message) => {
                return {
                    type: TranslationCheck.Grammar,
                    logLevel,
                    message,
                };
            }) ?? []
        );
    }

    disconnectSocket() {
        this.socketService.disconnectSocket();
    }

    decompress(getUtteranceRequestModel: GetUtteranceRequestModel) {
        this.socketService.socket.emit('get-utterances', getUtteranceRequestModel);
    }

    getUtterances = () => {
        this.socketService.socket.on('get-utterances', (response: GetUtteranceResponseModel) => {
            this.compressDecompressService.setUtterancesState(response);
        });
    };
}
