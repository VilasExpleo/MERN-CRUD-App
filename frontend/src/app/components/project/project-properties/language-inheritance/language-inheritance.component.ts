import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
@Component({
    selector: 'app-language-inheritance',
    templateUrl: './language-inheritance.component.html',
    styleUrls: ['./language-inheritance.component.scss'],
    providers: [ConfirmationService],
})
export class LanguageInheritanceComponent implements OnInit {
    languageInheritance: TreeNode[] = [];
    state: any;
    flatLanguageArray: any = [];
    submitBtn = true;
    isRawProject = false;
    constructor(
        private ref: DynamicDialogRef,
        private projectPropertiesService: ProjectPropertiesService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private projectService: ProjectService,
        private readonly eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.isRawProject = this.projectPropertiesService.projectType === 'raw' ?? true;
        this.projectService
            .getPropertiesState()
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res) {
                    const tree = res?.properties?.language_inheritance_tree;
                    if (tree) {
                        this.state = res;
                        this.languageInheritance = this.isStringified(tree);
                    }
                }
            });
    }
    isStringified(str) {
        try {
            return JSON.parse(str);
        } catch (error) {
            return str;
        }
    }

    onNodeDrop() {
        this.submitBtn = false;
    }
    saveLanguageInheritance() {
        const updateRowOnDashboard = {
            title: this.state.properties?.project_properties?.title,
            date: this.state.properties?.project_properties?.due_date,
            version_no: this.state.properties?.project_properties?.version_no,
        };
        this.eventBus.cast('onProjectPropertiesChanges:editorLanguageChanges', updateRowOnDashboard);
        this.ref.close();
        this.manageLanguageInheritance();
        this.projectPropertiesService
            .updateProjectProperties(this.state.properties)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.state.isProjectPropertiesUpdated = 1;
                    this.submitBtn = true;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Project properties updated successfully',
                    });
                }
                this.projectService.setPropertiesState(this.state);
            });
    }

    manageLanguageInheritance() {
        this.flatLanguageArray = this.convertTreeArrayToFlatArray(this.languageInheritance, '', '');
        const flatLanguageInheritanceArray = this.flatLanguageArray.map((language) => ({
            project_id: this.state?.properties?.project_properties?.project_id,
            language_id: language.language_id,
            language_name: language.language_name,
            parent_language_id: language.parent_language_id,
            parent_language_name: language.parent_language_name,
        }));

        this.state.properties.language_inheritance_tree = JSON.stringify(
            this.languageInheritance,
            this.getCircularReplacer()
        );
        this.state.properties.language_inheritance = flatLanguageInheritanceArray;
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
    getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    };

    nextTab(): void {
        this.manageLanguageInheritance();
        this.projectService.setPropertiesState(this.state);
        this.projectPropertiesService.setState(4);
    }

    prevTab(): void {
        this.projectPropertiesService.setState(2);
    }

    private convertTreeArrayToFlatArray(tree, parentId = '', parentName = '') {
        const flatArray = [];
        for (const element of tree) {
            const flatElement = {
                ...element,
                parent_language_id: parentId,
                parent_language_name: parentName,
            };
            flatArray.push(flatElement);
            if (element.children && element.children.length > 0) {
                flatArray.push(
                    ...this.convertTreeArrayToFlatArray(element.children, element.language_id, element.language_name)
                );
            }
        }
        return flatArray;
    }
}
