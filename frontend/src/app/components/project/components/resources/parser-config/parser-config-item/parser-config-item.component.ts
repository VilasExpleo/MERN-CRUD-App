import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { GrammarParserConfigurationService } from 'src/app/core/services/resource/grammar-parser-configuration.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { GrammarParserConfigurationDownloadRequestModel } from 'src/app/shared/models/grammar-parser/grammar-parser-configuration-download.request.model';
import { GrammarParserDeleteRequestModel } from 'src/app/shared/models/grammar-parser/grammar-parser-delete-request.model';
import {
    GPConfigFileTypeEnum,
    GPConfigurationErrorMessageEnum,
    GPProjectRoleEnum,
    GPStandardConfigEnum,
    GPStandardFileNameEnum,
} from '../config-type.enum';
import {
    ConfigurationModel,
    GrammarParserModel,
    ParserConfigurationDetailsModel,
    ParserConfigurationModel,
} from './parser-config.model';

@Component({
    selector: 'app-parser-config-item',
    templateUrl: './parser-config-item.component.html',
    styleUrls: ['./parser-config-item.component.scss'],
})
export class ParserConfigItemComponent implements OnInit, OnDestroy {
    @Input()
    configType: GPStandardConfigEnum;

    @Input()
    parserDetails: ConfigurationModel;

    @Output()
    setParserMessageEvent: EventEmitter<ParserConfigurationModel> = new EventEmitter<ParserConfigurationModel>();

    @Output()
    removeMessageEvent: EventEmitter<ParserConfigurationModel> = new EventEmitter<ParserConfigurationModel>();

    @Output()
    downloadEvent: EventEmitter<GrammarParserConfigurationDownloadRequestModel> =
        new EventEmitter<GrammarParserConfigurationDownloadRequestModel>();

    parseConfigurations: ParserConfigurationDetailsModel[] = [];

    private xmlProjectId: string;
    private ProjectId: string;
    private destroyed$ = new Subject<boolean>();
    constructor(
        private readonly parserConfigurationService: GrammarParserConfigurationService,
        private readonly userService: UserService,
        private readonly projectService: ProjectService,
        private readonly messageService: MessageService
    ) {}

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    ngOnInit(): void {
        this.projectService
            .getPropertiesState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: any) => {
                if (response?.properties) {
                    this.xmlProjectId = response?.properties?.project_properties?.existing_project_id;
                    this.ProjectId = response?.properties?.project_properties?.project_id;
                }
            });

        this.projectService
            .getBaseFileState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: any) => {
                if (response?.uuid) this.xmlProjectId = response?.uuid;
            });

        this.projectService
            .getParseConfigurationState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: GrammarParserModel) => {
                if (response) this.parseConfigurations = response.parseConfigurationDetailsModel;
            });
    }

    onFileUpload(event, parseConfiguration: ParserConfigurationDetailsModel, fileUpload: any) {
        if (event?.currentFiles[0]) {
            parseConfiguration.file = event?.currentFiles[0];
            let formData = new FormData();
            formData = this.getFormData(parseConfiguration);
            if (formData) {
                this.parserConfigurationService
                    .upload(this.getFormData(parseConfiguration))
                    .pipe(catchError(() => of(fileUpload.clear())))
                    .subscribe((response: ApiBaseResponseModel) => {
                        fileUpload.clear();
                        this.handleApiResponse(response, parseConfiguration, event);
                    });
            }
        }
    }

    private handleApiResponse(
        response: ApiBaseResponseModel,
        parseConfiguration: ParserConfigurationDetailsModel,
        event: any
    ) {
        if (response.status === ResponseStatusEnum.OK) {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: response.message,
            });
            parseConfiguration.gpConfigId = response.data.gpConfigId;
            parseConfiguration.fileName = event?.currentFiles[0].name;
            this.updateParserConfigurationState(parseConfiguration, response, event);
            this.removeMessageEvent.emit(this.parserMessageConfiguration(parseConfiguration));
        } else {
            parseConfiguration.gpConfigId = undefined;
            parseConfiguration.fileName = GPStandardFileNameEnum.fileName;
            this.setParserMessageEvent.emit(this.parserMessageConfiguration(parseConfiguration, response.message));
        }
    }

    private parserMessageConfiguration(
        parseConfiguration?: ParserConfigurationDetailsModel,
        message?: string
    ): ParserConfigurationModel {
        if (parseConfiguration.standardType === GPConfigFileTypeEnum.COMMAND) {
            if (parseConfiguration.title === GPProjectRoleEnum.Editor) {
                return this.getParseConfigurationMessage(message, GPConfigurationErrorMessageEnum.SSMLEditor);
            } else {
                return this.getParseConfigurationMessage(message, GPConfigurationErrorMessageEnum.SSMLTranslator);
            }
        } else {
            if (parseConfiguration.title === GPProjectRoleEnum.Editor) {
                return this.getParseConfigurationMessage(message, GPConfigurationErrorMessageEnum.SRGSEditor);
            } else {
                return this.getParseConfigurationMessage(message, GPConfigurationErrorMessageEnum.SRGSTranslator);
            }
        }
    }

    private getParseConfigurationMessage(
        message?: string,
        gpConfigurationErrorMessageEnum?: GPConfigurationErrorMessageEnum
    ): ParserConfigurationModel {
        return {
            message: message,
            messageSource: gpConfigurationErrorMessageEnum,
        };
    }

    private updateParserConfigurationState(
        parseConfiguration: ParserConfigurationDetailsModel,
        response: ApiBaseResponseModel,
        event?: any
    ): void {
        this.parseConfigurations
            .filter(
                (parseConfig: ParserConfigurationDetailsModel) =>
                    parseConfig.title === parseConfiguration.title &&
                    parseConfig.standardType === parseConfiguration.standardType
            )
            .map((parseConfig: ParserConfigurationDetailsModel) => {
                return {
                    ...parseConfig,
                    gpConfigId: response?.data?.gpConfigId,
                    fileName: event?.currentFiles[0].name ?? GPStandardFileNameEnum.fileName,
                };
            });

        this.projectService.setParseConfigurationState({
            parseConfigurationDetailsModel: this.parseConfigurations,
            formChange: true,
        });
    }

    delete(parseConfiguration: ParserConfigurationDetailsModel) {
        const deleteParserConfigFileRequestModel: GrammarParserDeleteRequestModel = {
            gpConfigIds: [parseConfiguration.gpConfigId],
        };
        this.parserConfigurationService
            .delete(deleteParserConfigFileRequestModel)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    parseConfiguration.gpConfigId = undefined;
                    parseConfiguration.fileName = GPStandardFileNameEnum.fileName;
                    this.updateParserConfigurationState(parseConfiguration, response);
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                }
            });
    }

    downloadParserConfigFile(parseConfiguration: ParserConfigurationDetailsModel) {
        const downloadParserConfigurationRequestModel: GrammarParserConfigurationDownloadRequestModel = {
            fileType: this.configType,
            id: parseConfiguration.gpConfigId,
            fileName: this.getFileNameWithExtension(parseConfiguration),
        };
        this.downloadEvent.emit(downloadParserConfigurationRequestModel);
    }

    getFileNameWithExtension(parseConfiguration: ParserConfigurationDetailsModel): string {
        if (parseConfiguration.fileName.split('.').length > 0) {
            return parseConfiguration.fileName;
        } else {
            if (parseConfiguration.standardType === GPConfigFileTypeEnum.COMMAND) {
                return parseConfiguration.fileName + '.' + 'properties';
            } else {
                return parseConfiguration.fileName + '.' + 'xml';
            }
        }
    }

    getFormData(parseConfiguration: ParserConfigurationDetailsModel): FormData {
        const formData = new FormData();
        formData.append('fileType', parseConfiguration.standardType);
        formData.append('configRole', parseConfiguration.role);
        formData.append('projectXmlId', this.xmlProjectId);
        formData.append('userId', this.userService.getUser().id.toString());
        formData.append('file', parseConfiguration.file);
        if (this.ProjectId) {
            formData.append('projectId', this.ProjectId);
        }
        return formData;
    }
}
