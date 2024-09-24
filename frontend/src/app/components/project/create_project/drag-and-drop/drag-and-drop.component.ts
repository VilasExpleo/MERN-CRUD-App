import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, Message, TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { Subscription, catchError, map, of } from 'rxjs';
import { LanguageService } from 'src/app/core/services/languages/languages.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Manager } from 'src/app/shared/models/translation-request/manager';

@Component({
    selector: 'app-drag-and-drop',
    templateUrl: './drag-and-drop.component.html',
    styleUrls: ['./drag-and-drop.component.scss'],
})
export class DragAndDropComponent implements OnInit {
    languagesFromApplication: TreeNode[] = [];
    langFromXML: any[] = [];
    automaticMappedLanguages: any[] = [];
    allLng: any[] = [];
    formData: any = {};
    mappedLanguageForm!: UntypedFormGroup;
    manuallyDraggedLang: any = [];
    msgs: Message[] = [];
    manager: Manager[];
    brand: string;
    mappedLangs = [];
    isMapDone = false;
    lngSttngSubs: Subscription;
    baseFileSubs: Subscription;
    @ViewChild('mappedLangTree') mappedLangTree: Tree;
    languageSettingForm: UntypedFormGroup;

    constructor(
        private languageService: LanguageService,
        private projectService: ProjectService,
        private router: Router,
        private confirmationService: ConfirmationService,
        public translationRequestService: TranslationRequestService,
        private userService: UserService,
        private fb: UntypedFormBuilder
    ) {}

    ngOnInit() {
        const url = `translation-member-data/project-manager-list`;
        this.brand = this.userService.getUser().brand_name.trim();
        this.translationRequestService
            .getManager(url, { brand: 'VW_11' })
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res) {
                    this.manager = res['data'];
                }
            });
        this.languageService.getLanguages().subscribe((languages: TreeNode[]) => {
            this.languagesFromApplication = languages;
            this.languagesFromApplication.forEach((d: any) => {
                if (d.children == undefined) {
                    this.allLng.push(d);
                } else {
                    d.children.forEach((dl: any) => {
                        this.allLng.push(dl);
                    });
                }
            });

            this.baseFileSubs = this.projectService
                .getBaseFileState()
                .pipe(
                    map((res) => {
                        this.automaticMappedLanguages = this.getCommonLanguages(res.langsFromXML);
                        return res.langsFromXML;
                    })
                )
                .subscribe((data) => {
                    this.langFromXML = data;
                });

            this.lngSttngSubs = this.projectService.getLangSettingState().subscribe({
                next: (res) => {
                    const tempMappedLangs = new Array<any>(this.langFromXML.length).fill({ label: null });
                    if (res === null) {
                        this.mappedLangs = tempMappedLangs;
                    } else {
                        this.mappedLangs = res.mappedLangs;
                        if (res.translationLanguage !== undefined) {
                            this.languageSettingForm.setValue({
                                translationLanguage: res.translationLanguage,
                                //selectedManager: res.selectedManager,
                            });
                        }
                        this.checkMapStatus();
                    }
                },
            });
        });

        this.languageSettingForm = this.fb.group({
            translationLanguage: ['', Validators.required],
        });
    }

    onNodeDrop(event) {
        if (!event.dragNode.children && this.mappedLangs.length <= this.langFromXML.length) {
            this.mappedLangs.splice(event.index, 1, event.dragNode);
            this.checkMapStatus();
            this.mapLangIds(this.langFromXML);
        }
    }

    onNodeDropBack(event) {
        if (event.dragNode.label !== null) {
            this.mappedLangs.splice(this.mappedLangTree.dragNodeIndex, 1, {
                label: null,
            });
            this.mapLangIds(this.langFromXML);
            this.checkMapStatus();
        }
    }

    //cancel popup
    showConfirm() {
        this.confirmationService.confirm({
            message: 'The data may be lost if you cancel the project creation. Are you sure you want to cancel?',
            header: 'Cancel Project',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.projectService.closeCreateDialog();
                this.router.navigate(['main/dashboard']);
                this.projectService.setBaseFileState(null);
                this.projectService.setlangPropertiesState(null);
                this.projectService.setLangSettingState(null);
                this.projectService.setLangInheritanceState(null);
                this.projectService.setMetaDataState(null);
                this.projectService.setUserSettingState(null);
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

    submitLanguageSettingsForm(form_data: any) {
        this.projectService.setLangSettingState({
            mappedLangs: this.mappedLangs,
            translationLanguage: form_data.translationLanguage,
        });
        this.router.navigate(['main/dashboard/language-inheritance']);
    }

    getCommonLanguages(langsFromXML): any[] {
        const commonLanguages = [];
        langsFromXML.map((lang) => {
            let langs;
            if (lang.Name.includes('_')) {
                langs = lang.Name.replace('_', '-');
            } else {
                langs = lang.Name;
            }
            const cE = this.allLng.find((item) => item.language_culture_name === langs);
            cE === undefined ? commonLanguages.push({ label: null }) : commonLanguages.push(cE);
        });
        return commonLanguages;
    }

    automaticMapping(form_data) {
        this.mappedLangs.forEach((l, i) => {
            if (l.label === null) {
                this.mappedLangs.splice(i, 1, this.automaticMappedLanguages[i]);
            }
        });
        this.mapLangIds(this.langFromXML);
        this.projectService.setLangSettingState({
            mappedLangs: this.mappedLangs,
            translationLanguage: form_data.translationLanguage,
        });
        this.checkMapStatus();
    }

    prevPage(form_data) {
        this.projectService.setLangSettingState({
            mappedLangs: this.mappedLangs,
            translationLanguage: form_data.translationLanguage,
        });
        this.router.navigate(['main/dashboard/properties-of-project']);
    }

    mapLangIds(langsFromXML) {
        for (let i = 0; i < langsFromXML.length; i++) {
            if (this.automaticMappedLanguages[i] != undefined) {
                langsFromXML[i].Id = this.automaticMappedLanguages[i].language_id;
            }
        }
    }

    ngOnDestroy() {
        this.baseFileSubs.unsubscribe();
        this.lngSttngSubs.unsubscribe();
    }

    checkMapStatus() {
        if (this.mappedLangs !== null) {
            const nullArr = this.mappedLangs.filter((lang) => lang.label === null);
            this.isMapDone = nullArr.length < 1 && this.langFromXML.length === this.mappedLangs.length;
        }
    }
}
