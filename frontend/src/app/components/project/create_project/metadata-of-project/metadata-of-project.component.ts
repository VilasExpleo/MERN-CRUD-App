import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, Message } from 'primeng/api';
import { Subject, Subscription, catchError, filter, of, takeUntil } from 'rxjs';
import { ResponseStatusEnum, TranslationRoleEnum } from 'src/Enumerations';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { GrammarParserConfigurationService } from 'src/app/core/services/resource/grammar-parser-configuration.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { GrammarParserDeleteRequestModel } from 'src/app/shared/models/grammar-parser/grammar-parser-delete-request.model';
import { UserModel } from 'src/app/shared/models/user/user.model';
import {
    GrammarParserModel,
    ParserConfigModel,
} from '../../components/resources/parser-config/parser-config-item/parser-config.model';
@Component({
    selector: 'app-metadata-of-project',
    templateUrl: './metadata-of-project.component.html',
    styleUrls: ['./metadata-of-project.component.scss'],
})
export class MetadataOfProjectComponent implements OnInit, OnDestroy {
    metadataOfProjectForm!: UntypedFormGroup;
    fontOption = [];
    lcOption = [];
    translationRole = [];
    msgs: Message[] = [];
    metaDataSubscription: Subscription;
    lengthCalcSubscription: Subscription;
    fontsSubscription: Subscription;
    roleSubscription: Subscription;
    isNextDisabled = true;
    isScreenshotsFileSelected = false;
    isDirectoriesOfConfigurationFileSelected = false;
    isMiscellaneousDocumentsFileSelected = false;
    screenshotsFile: File;
    directoriesOfConfigurationFile: File;
    miscellaneousDocumentsFile: File;
    currentUserInformation: UserModel;
    parserConfigModel: ParserConfigModel;
    userRole;
    grammarParserIds: number[];
    parseConfigurationsSubscription: Subscription;
    grammarParserModel: GrammarParserModel;
    private destroyed$ = new Subject<boolean>();
    constructor(
        private router: Router,
        private projectService: ProjectService,
        private confirmationService: ConfirmationService,
        private parserConfigurationService: GrammarParserConfigurationService
    ) {}

    ngOnInit(): void {
        this.getExistingParseConfigData();
        this.parserConfigModel = this.parserConfigurationService.getCreateParseConfiguration(this.grammarParserModel);
        if (this.parserConfigModel) {
            this.projectService.setParseConfigurationState({
                parseConfigurationDetailsModel: [
                    this.parserConfigModel.speechCommands.editor,
                    this.parserConfigModel.speechCommands.translator,
                    this.parserConfigModel.speechPrompts.editor,
                    this.parserConfigModel.speechPrompts.translator,
                ],
            });
        }
        this.metaDataSubscription = this.projectService
            .getLcAndFontState()
            .pipe(filter((response) => !!response))
            .subscribe((response) => {
                this.isNextDisabled =
                    (!response.defaultLengthCalculationsOfVectorFonts.length || !response.defaultFontPackages) &&
                    response.translationRole === TranslationRoleEnum.Constrained;
            });

        this.parseConfigurationsSubscription = this.projectService
            .getParseConfigurationState()
            .subscribe((response: GrammarParserModel) => {
                if (response)
                    this.grammarParserIds = response.parseConfigurationDetailsModel
                        .filter((parserConfig) => parserConfig.gpConfigId)
                        ?.map((parserConfig) => parserConfig?.gpConfigId);
            });
    }

    ngOnDestroy() {
        this.metaDataSubscription?.unsubscribe();
        if (this.parseConfigurationsSubscription) {
            this.parseConfigurationsSubscription.unsubscribe();
        }
    }

    navigateToNext() {
        this.router.navigate(['main/dashboard/users']);
    }
    navigateToPrevious() {
        this.router.navigate(['main/dashboard/language-inheritance']);
    }

    showConfirm() {
        this.confirmationService.confirm({
            message: 'The data may be lost if you cancel the project creation. Are you sure you want to cancel?',
            header: 'Cancel Project',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.projectCancelCreationTimeDeleteParserConfigFiles();
                this.projectService.closeCreateDialog();
                this.router.navigate(['main/dashboard']);
                this.projectService.setBaseFileState(null);
                this.projectService.setlangPropertiesState(null);
                this.projectService.setLangSettingState(null);
                this.projectService.setLangInheritanceState(null);
                this.projectService.setMetaDataState(null);
                this.projectService.setUserSettingState(null);
                this.projectService.setLcAndFontState(null);
            },
            reject: () => {
                this.msgs = [
                    {
                        severity: 'info',
                        summary: 'Rejected',
                        detail: 'You have rejected',
                    },
                ];
            },
        });
    }

    projectCancelCreationTimeDeleteParserConfigFiles() {
        const deleteParserConfigFileRequestModel: GrammarParserDeleteRequestModel = {
            gpConfigIds: this.grammarParserIds,
        };
        this.parserConfigurationService
            .delete(deleteParserConfigFileRequestModel)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response?.status === ResponseStatusEnum.OK) {
                    this.msgs = [
                        {
                            severity: 'success',
                            summary: 'Success',
                            detail: response.message,
                        },
                    ];
                }
            });
    }

    getExistingParseConfigData() {
        this.parseConfigurationsSubscription = this.projectService
            .getParseConfigurationState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: GrammarParserModel) => {
                this.grammarParserModel = response;
            });
    }
}
