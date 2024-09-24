import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { UsersRoles } from 'src/Enumerations';
import {
    GPConfigFileTypeEnum,
    GPProjectRoleEnum,
    GPStandardFileNameEnum,
} from 'src/app/components/project/components/resources/parser-config/config-type.enum';
import {
    ConfigurationModel,
    ParserConfigurationDetailsModel,
    ParserConfigModel,
    GrammarParserModel,
} from 'src/app/components/project/components/resources/parser-config/parser-config-item/parser-config.model';
import { GrammarParserConfigurationDownloadRequestModel } from 'src/app/shared/models/grammar-parser/grammar-parser-configuration-download.request.model';
import { GrammarParserDeleteRequestModel } from 'src/app/shared/models/grammar-parser/grammar-parser-delete-request.model';
import { ApiService } from '../api.service';
@Injectable({
    providedIn: 'root',
})
export class GrammarParserConfigurationService {
    parseConfigurationDetails: ParserConfigurationDetailsModel[] = [];
    constructor(private apiService: ApiService) {}

    download(url: string, payload: GrammarParserConfigurationDownloadRequestModel): Observable<any> {
        return this.apiService
            .postTypeDownloadRequest(url, payload, {
                responseType: 'blob',
            })
            .pipe(catchError(() => of(undefined)));
    }

    upload(parseConfigFormData: FormData) {
        return this.apiService.postTypeRequest('grammar-parser/upload', parseConfigFormData);
    }

    delete(payload: GrammarParserDeleteRequestModel) {
        return this.apiService.deleteTypeRequest('grammar-parser/delete', payload);
    }

    getCreateParseConfiguration(grammarParserModel?: GrammarParserModel): ParserConfigModel {
        const existingSSMLEditorParserConfig = grammarParserModel?.parseConfigurationDetailsModel.find(
            (parserConfig) =>
                parserConfig.title === GPProjectRoleEnum.Editor &&
                parserConfig.standardType === GPConfigFileTypeEnum.COMMAND
        );
        const existingSSMLTranslatorParserConfig = grammarParserModel?.parseConfigurationDetailsModel.find(
            (parserConfig) =>
                parserConfig.title === GPProjectRoleEnum.Translator &&
                parserConfig.standardType === GPConfigFileTypeEnum.COMMAND
        );
        const existingSRGSEditorParserConfig = grammarParserModel?.parseConfigurationDetailsModel.find(
            (parserConfig) =>
                parserConfig.title === GPProjectRoleEnum.Editor &&
                parserConfig.standardType === GPConfigFileTypeEnum.PROMPT
        );
        const existingSRGSTranslatorParserConfig = grammarParserModel?.parseConfigurationDetailsModel.find(
            (parserConfig) =>
                parserConfig.title === GPProjectRoleEnum.Translator &&
                parserConfig.standardType === GPConfigFileTypeEnum.PROMPT
        );
        const speechCommandsEditor = this.getGPConfigurationDetails(
            existingSSMLEditorParserConfig?.fileName ?? GPStandardFileNameEnum.fileName,
            GPProjectRoleEnum.Editor,
            GPConfigFileTypeEnum.COMMAND,
            UsersRoles.Editor,
            existingSSMLEditorParserConfig?.gpConfigId,
            'Configuration for speech commands'
        );

        const speechCommandsTranslator = this.getGPConfigurationDetails(
            existingSSMLTranslatorParserConfig?.fileName ?? GPStandardFileNameEnum.fileName,
            GPProjectRoleEnum.Translator,
            GPConfigFileTypeEnum.COMMAND,
            UsersRoles.Translator,
            existingSSMLTranslatorParserConfig?.gpConfigId,
            'Configuration for speech commands'
        );
        const promptCommandsEditor = this.getGPConfigurationDetails(
            existingSRGSEditorParserConfig?.fileName ?? GPStandardFileNameEnum.fileName,
            GPProjectRoleEnum.Editor,
            GPConfigFileTypeEnum.PROMPT,
            UsersRoles.Editor,
            existingSRGSEditorParserConfig?.gpConfigId,
            'Configuration for speech prompts'
        );
        const promptCommandsTranslator = this.getGPConfigurationDetails(
            existingSRGSTranslatorParserConfig?.fileName ?? GPStandardFileNameEnum.fileName,
            GPProjectRoleEnum.Translator,
            GPConfigFileTypeEnum.PROMPT,
            UsersRoles.Translator,
            existingSRGSTranslatorParserConfig?.gpConfigId,
            'Configuration for speech prompts'
        );
        return {
            speechCommands: this.getConfiguration(speechCommandsEditor, speechCommandsTranslator),
            speechPrompts: this.getConfiguration(promptCommandsEditor, promptCommandsTranslator),
        };
    }

    getParseConfiguration(parseConfigurationModel?: ParserConfigurationDetailsModel): ParserConfigurationDetailsModel {
        return {
            fileName: parseConfigurationModel.fileName,
            type: parseConfigurationModel.type,
            gpConfigId: parseConfigurationModel.gpConfigId,
            title: parseConfigurationModel.title,
            standardType: parseConfigurationModel.standardType,
            role: parseConfigurationModel.role,
        };
    }

    getConfiguration(
        parseConfigurationModelEditor?: ParserConfigurationDetailsModel,
        parseConfigurationModelTranslator?: ParserConfigurationDetailsModel
    ): ConfigurationModel {
        return {
            editor: this.getParseConfiguration(parseConfigurationModelEditor),
            translator: this.getParseConfiguration(parseConfigurationModelTranslator),
        };
    }

    getGPConfigurationDetails(
        gpStandardFileNameEnum: string | GPStandardFileNameEnum,
        gpProjectRoleEnum: GPProjectRoleEnum,
        gpConfigFileTypeEnum: GPConfigFileTypeEnum,
        usersRoles: UsersRoles,
        gpConfigId?: number,
        type?: string
    ): ParserConfigurationDetailsModel {
        return {
            fileName: gpStandardFileNameEnum,
            title: gpProjectRoleEnum,
            type: type,
            standardType: gpConfigFileTypeEnum,
            role: usersRoles.toString(),
            gpConfigId: gpConfigId,
        };
    }
}
