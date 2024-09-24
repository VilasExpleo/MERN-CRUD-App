import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ManageRawProjectService } from '../../../../../core/services/data-creator/manage-raw-project.service';
import { RawProjectService } from '../../../../../core/services/data-creator/raw-project.service';
import { UseCaseEnum } from '../../../../../shared/enums/use-case.enum';
import { LanguageModel, ManageRawProjectStateModel } from '../manage-raw-project-state.model';
import { ManageRawProjectLanguageStepModel } from './manage-raw-project-language-step.model';

@Component({
    selector: 'app-manage-raw-project-language',
    templateUrl: './manage-raw-project-language.component.html',
})
export class ManageRawProjectLanguageComponent implements OnInit {
    UseCase = UseCaseEnum;

    model: ManageRawProjectStateModel = this.manageRawProjectService.getInitialState();
    @Output() navigationEvent = new EventEmitter<number>();
    @Output() closeEvent: EventEmitter<boolean> = new EventEmitter(true);
    @Output() loadingChange: EventEmitter<boolean> = new EventEmitter(true);

    @Output()
    updateEvent = new EventEmitter();

    stepControl = {
        index: 1,
        nextStep: 2,
        previousStep: 0,
    };

    sourceHeaderText = 'Available';
    targetHeaderText = 'Selected';

    constructor(
        private rawProjectService: RawProjectService,
        private manageRawProjectService: ManageRawProjectService
    ) {}

    ngOnInit(): void {
        this.setLoading(true);
        this.manageRawProjectService.getDataForStepLanguages().subscribe({
            next: (response: ManageRawProjectLanguageStepModel) => {
                if (response) {
                    this.model = response.model;
                    this.model.availableOptions.languages = this.getAvailableLanguageWithoutSelectedLanguages(
                        response.languages
                    );
                }
                this.setLoading(false);
            },
        });
    }

    private setLoading(value: boolean) {
        this.loadingChange.emit(value);
    }

    private getAvailableLanguageWithoutSelectedLanguages(availableLanguages: LanguageModel[]): LanguageModel[] {
        //create array with index equal to languageId for each element
        const selectedLanguageById = this.model.rawProject.languages.reduce((ac, language) => {
            if (language.languageId) {
                return {
                    ...ac,
                    [language.languageId]: language,
                };
            }
            return ac;
        }, {});

        return availableLanguages.filter((language) => {
            return !selectedLanguageById[language.languageId];
        });
    }

    navigateToNextStep(stepIndex: number) {
        this.manageRawProjectService.setManageRawProjectModel(this.model);
        this.navigationEvent.emit(stepIndex);
    }

    nextStep() {
        this.navigateToNextStep(this.stepControl.nextStep);
    }

    previousStep() {
        this.navigateToNextStep(this.stepControl.previousStep);
    }

    cancel() {
        this.closeEvent.emit(true);
    }

    updateProjectDetails() {
        this.manageRawProjectService.setManageRawProjectModel(this.model);
        this.updateEvent.emit();
    }
}
