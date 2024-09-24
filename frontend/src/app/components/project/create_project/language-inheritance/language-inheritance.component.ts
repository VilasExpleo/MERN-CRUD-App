import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, Message, TreeNode } from 'primeng/api';
import { Subscription, combineLatest } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project/project.service';

@Component({
    selector: 'app-language-inheritance',
    templateUrl: './language-inheritance.component.html',
    styleUrls: ['./language-inheritance.component.scss'],
})
export class LanguageInheritanceTreeComponent implements OnInit {
    langFromXmlInheritance!: TreeNode[];
    manuallyDraggedLang = [];
    msgs: Message[] = [];
    lngInheritanceSubs: Subscription;

    mappedLangs;
    constructor(
        private projectService: ProjectService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    onDrop(dropLang: any) {
        this.manuallyDraggedLang.push(dropLang);
    }
    ngOnInit(): void {
        const baseFileState = this.projectService.getBaseFileState();
        const langInheritanceState = this.projectService.getLangInheritanceState();
        const mapLanguageWithXML$ = combineLatest([baseFileState, langInheritanceState]);
        this.lngInheritanceSubs = mapLanguageWithXML$.subscribe(([baseFileRes, langInheritanceRes]) => {
            this.langFromXmlInheritance = langInheritanceRes.map((language, index) => {
                const xmlLanguage = baseFileRes.langsFromXML[index];
                if (xmlLanguage && xmlLanguage.Id !== undefined && xmlLanguage.Name === language.language_name) {
                    language.language_id = xmlLanguage.Id;
                }
                return language;
            });
        });
    }

    ngOnDestroy() {
        this.lngInheritanceSubs.unsubscribe();
    }

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

    nextPage() {
        this.projectService.setLangInheritanceState(this.langFromXmlInheritance);
        this.router.navigate(['main/dashboard/resource']);
    }
    prevPage() {
        this.projectService.setLangInheritanceState(this.langFromXmlInheritance);
        this.router.navigate(['main/dashboard/language-setting']);
    }
}
