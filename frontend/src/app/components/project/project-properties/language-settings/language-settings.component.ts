import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';
import { catchError, of } from 'rxjs';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
@Component({
    selector: 'app-language-settings',
    templateUrl: './language-settings.component.html',
    styleUrls: ['./language-settings.component.scss'],
    providers: [ConfirmationService],
})
export class LanguageSettingsComponent implements OnInit {
    availableLanguages: TreeNode[] = [];
    allLnguagesFlatList: any[] = [];
    mappedLanguages: any[] = [];
    languagesFromXML: any[];
    editorDropdownLanguages: any[];
    languageSettingForm: UntypedFormGroup;
    editorLanguageID: any;
    editorLanguage: any;
    state: any;
    isMapDone = false;
    submitBtn = true;
    isRawProject = false;
    @Output()
    closeEvent = new EventEmitter();
    @ViewChild('mappedLangTree') mappedLangTree: Tree;

    constructor(
        private ref: DynamicDialogRef,
        private config: DynamicDialogConfig,
        private projectPropertiesService: ProjectPropertiesService,
        private projectService: ProjectService,
        private fb: UntypedFormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.isRawProject = this.projectPropertiesService.projectType === 'raw' ?? true;
        this.allLnguagesFlatList = [];
        this.mappedLanguages = [];
        this.projectService.getPropertiesState().subscribe((res) => {
            this.state = res;
            this.languagesFromXML = res?.projectData?.languages;
            this.editorLanguageID = res?.properties?.project_properties?.editor_language;
            this.getAvailableLanguages();
        });
        const selectedTranslationLang =
            this.languagesFromXML?.find((language) => language.language_id === this.editorLanguageID) ?? '';
        this.languageSettingForm = this.fb.group({
            translationLanguage: [selectedTranslationLang],
        });
        this.languageSettingForm.valueChanges.subscribe(() => {
            this.submitBtn = false;
        });
    }

    getAvailableLanguages() {
        const languageURL = `langdata`;
        this.projectPropertiesService
            .getAvailableLanguages(languageURL)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.availableLanguages = res?.['data'];
                    this.availableLanguages.forEach((d: any) => {
                        if (d.children == undefined) {
                            this.allLnguagesFlatList.push(d);
                        } else {
                            d.children.forEach((dl: any) => {
                                this.allLnguagesFlatList.push(dl);
                            });
                        }
                    });
                    this.mappedLanguages = [];
                    this.languagesFromXML?.forEach((element) => {
                        this.mappedLanguages.push(
                            this.allLnguagesFlatList?.find(
                                (x) => x['language_culture_name'] == element.mapped_language
                            ) || { label: null }
                        );
                    });
                    this.editorDropdownLanguages = [];
                    this.languagesFromXML?.forEach((element) => {
                        this.editorDropdownLanguages.push(
                            this.allLnguagesFlatList?.find((x) => x['language_culture_name'] == element.xml_language)
                        );
                    });
                    this.editorLanguage = this.languagesFromXML.filter((item) => {
                        return item.language_id == this.editorLanguageID;
                    });
                    this.languageSettingForm.patchValue({
                        translationLanguage: this.editorLanguage[0],
                    });
                    if (!this.languageSettingForm.value.translationLanguage) this.submitBtn = true;
                }
            });
    }
    onNodeDropToSource() {
        this.mappedLanguages.splice(this.mappedLangTree.dragNodeIndex, 1, {
            label: null,
        });

        const nullVal = this.mappedLanguages.filter((item) => item.label == null);
        if (nullVal.length > 0) {
            this.isMapDone = true;
        }
    }
    onNodeDropToDestination(event) {
        this.submitBtn = false;
        if (!event.dragNode.children) {
            this.mappedLanguages.splice(event.index, 1, event.dragNode);
        }
        const nullVal = this.mappedLanguages.filter((item) => item.label == null);
        if (nullVal.length == 0) {
            this.isMapDone = false;
        }
    }

    submitLanguageSettingForm(form_data) {
        this.manageLanguageSettings(form_data);
        this.projectPropertiesService
            .updateProjectProperties(this.state.properties)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.submitBtn = true;
                    this.state.isProjectPropertiesUpdated = 1;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Project properties updated successfully',
                    });
                    this.projectService.setPropertiesState(this.state);
                }
                this.closeEvent.emit();
            });
    }

    manageLanguageSettings(form_data) {
        this.state.properties.project_properties.editor_language = form_data?.translationLanguage?.language_id;
        const mappedArray = [];
        this.mappedLanguages.forEach((item, index) => {
            mappedArray.push({
                project_id: this.config?.data?.project_id,
                version_no: this.config?.data?.version_no,
                language_id: item.language_id,
                xml_language: this.languagesFromXML[index].xml_language,
                mapped_language: item.language_culture_name,
            });
        });
        this.state.properties.language_mapping = mappedArray;
        this.state.projectData.languages = [...this.state.properties.language_mapping];
        const filterlangId = this.state.properties.language_mapping.find((lang) => {
            return lang.xml_language == form_data?.translationLanguage?.xml_language;
        });
        this.state.properties.project_properties.editor_language = filterlangId.language_id;
        this.updateLanguageInheritanceState();
    }

    closePropertiesDialogOnCancel() {
        if (!this.submitBtn) {
            this.confirmationService.confirm({
                message: 'Are you sure you want to cancel?',
                header: 'Cancel Properties',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.ref.close();
                },
            });
        } else {
            this.ref.close();
        }
    }

    nextTab(form_data): void {
        this.manageLanguageSettings(form_data);
        this.projectService.setPropertiesState(this.state);
        this.projectPropertiesService.setState(3);
    }

    prevTab(): void {
        this.projectPropertiesService.setState(1);
    }

    private updateLanguageInheritanceState() {
        this.state.properties.language_inheritance = this.state?.properties?.language_inheritance.map((language) => {
            const mappedLangs = this.state.properties.language_mapping.find(
                (lang) => lang.xml_language === language.language_name
            );

            if (mappedLangs) {
                language.language_id = mappedLangs.language_id;

                const parentIndex = this.state.properties.language_inheritance.findIndex(
                    (lang) => lang.parent_language_name === language.language_name
                );

                if (parentIndex !== -1) {
                    this.state.properties.language_inheritance[parentIndex].parent_language_id =
                        mappedLangs.language_id;
                }
            }
            return language;
        });
    }
}
