import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { GrammarParserConfigurationService } from 'src/app/core/services/resource/grammar-parser-configuration.service';
import { GrammarParserConfigurationDownloadRequestModel } from 'src/app/shared/models/grammar-parser/grammar-parser-configuration-download.request.model';
import { GPConfigFileTypeEnum, GPProjectRoleEnum, GPStandardConfigEnum } from './config-type.enum';
import {
    GrammarParserModel,
    ParserConfigModel,
    ParserConfigurationDetailsModel,
    ParserConfigurationModel,
} from './parser-config-item/parser-config.model';

@Component({
    selector: 'app-parser-config',
    templateUrl: './parser-config.component.html',
})
export class ParserConfigComponent implements OnInit, OnDestroy {
    configType = GPStandardConfigEnum;

    @Input()
    parserConfigModel: ParserConfigModel;

    parseErrorMessages: ParserConfigurationModel[] = [];
    parserConfigurationSubscription: Subscription;
    private destroyed$ = new Subject<boolean>();

    constructor(
        private parserConfigurationService: GrammarParserConfigurationService,
        private projectService: ProjectService,
        private projectReportService: ProjectReportService,
        private messageService: MessageService
    ) {}

    ngOnDestroy(): void {
        if (this.parserConfigurationSubscription) {
            this.parserConfigurationSubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
        this.parserConfigurationSubscription = this.projectService
            .getParseConfigurationState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: GrammarParserModel) => {
                if (response) {
                    const commandConfig = response.parseConfigurationDetailsModel.filter(
                        (item) => item.standardType === GPConfigFileTypeEnum.COMMAND
                    );
                    const promptConfig = response.parseConfigurationDetailsModel.filter(
                        (item) => item.standardType === GPConfigFileTypeEnum.PROMPT
                    );

                    this.updateParserConfigForCommand(commandConfig);
                    this.updateParserConfigForPrompt(promptConfig);
                }
            });
    }

    private updateParserConfigForCommand(commandConfig: ParserConfigurationDetailsModel[]): void {
        this.parserConfigModel.speechCommands.editor.gpConfigId = commandConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Editor
        )?.gpConfigId;
        this.parserConfigModel.speechCommands.editor.fileName = commandConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Editor
        )?.fileName;
        this.parserConfigModel.speechCommands.translator.gpConfigId = commandConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Translator
        )?.gpConfigId;
        this.parserConfigModel.speechCommands.translator.fileName = commandConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Translator
        )?.fileName;
    }
    private updateParserConfigForPrompt(promptConfig: ParserConfigurationDetailsModel[]): void {
        this.parserConfigModel.speechPrompts.editor.gpConfigId = promptConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Editor
        )?.gpConfigId;
        this.parserConfigModel.speechPrompts.editor.fileName = promptConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Editor
        )?.fileName;
        this.parserConfigModel.speechPrompts.translator.gpConfigId = promptConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Translator
        )?.gpConfigId;
        this.parserConfigModel.speechPrompts.translator.fileName = promptConfig?.find(
            (item) => item.title === GPProjectRoleEnum.Translator
        )?.fileName;
    }

    downloadConfiguration(configType: GPStandardConfigEnum, parserConfigId?: number) {
        const downloadParserConfigurationRequestModel: GrammarParserConfigurationDownloadRequestModel = {
            fileType: configType,
            id: parserConfigId,
        };
        if (configType === GPStandardConfigEnum.SSMLStandard) {
            downloadParserConfigurationRequestModel.fileName = this.parserConfigModel.speechCommands.editor.fileName =
                'SSMLStandardCofig.properties';
            downloadParserConfigurationRequestModel.fileType = GPConfigFileTypeEnum.COMMAND;
        } else {
            downloadParserConfigurationRequestModel.fileName = 'SRGSStandardConfig.xml';
            downloadParserConfigurationRequestModel.fileType = GPConfigFileTypeEnum.PROMPT;
        }
        this.download(downloadParserConfigurationRequestModel);
    }

    setParserMessage(parseConfigurationModel: ParserConfigurationModel): void {
        if (this.getParserConfigMessage(parseConfigurationModel)) {
            this.getParserConfigMessage(parseConfigurationModel).message = parseConfigurationModel?.message;
        } else {
            this.parseErrorMessages.push(parseConfigurationModel);
        }
    }

    removeMessageInParserErrorMessages(parseConfigurationModel: ParserConfigurationModel): void {
        this.parseErrorMessages = this.parseErrorMessages.filter(
            (message) => message.messageSource !== parseConfigurationModel.messageSource
        );
    }

    download(downloadParserConfigurationRequestModel: GrammarParserConfigurationDownloadRequestModel) {
        this.parserConfigurationService
            .download('grammar-parser/download', {
                fileType: downloadParserConfigurationRequestModel.fileType,
                id: downloadParserConfigurationRequestModel.id,
            })
            .subscribe((response: any) => {
                if (response) {
                    this.projectReportService.downloadReport(
                        response,
                        downloadParserConfigurationRequestModel.fileName
                    );
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                }
            });
    }

    getParserConfigMessage(parseConfigurationModel): ParserConfigurationModel {
        return this.parseErrorMessages.find((item) => item?.messageSource === parseConfigurationModel.messageSource);
    }
}
