import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
    selector: 'app-base-file',
    templateUrl: './base-file.component.html',
    styleUrls: ['./base-file.component.scss'],
})
export class BaseFileComponent implements OnInit {
    xmlProperties: object;
    languages: any = [];
    langCount: number;
    xmlID: string;
    variantLength: number;
    variants: any;
    constructor(
        private projectPropertiesService: ProjectPropertiesService,
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private projectService: ProjectService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.projectPropertiesService.projectType = this.config?.data?.isRawProject ? 'raw' : 'real';
        this.projectPropertiesService
            .getProjectProperties(this.config?.data?.project_id)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    res?.['data']?.['languages'].map((item) => {
                        this.languages.push(item.xml_language);
                    });
                    this.langCount = this.languages.length;
                    this.languages = this.languages.join(', ');
                    this.xmlProperties = res?.['data']?.['properties']?.[0];
                    const variant = this.xmlProperties?.['variant'].split(',');
                    this.variantLength = variant[0] === '' ? 0 : this.xmlProperties?.['variant'].split(',').length;
                    this.variants = this.xmlProperties?.['variant'].split(',').join(', ');
                    this.xmlID = this.xmlProperties?.['existing_project_id'].trim();
                    this.setProperties(res);
                    if (this.config?.data?.isRawProject) {
                        this.projectPropertiesService.setState(1);
                    }
                }
            });
    }

    closePropertiesDialogOnCancel() {
        this.ref.close();
    }

    private setProperties(res) {
        const propertiesData = {};
        const properties = res?.['data']?.['properties'][0];

        propertiesData['language_mapping'] = res['data']['languages'].map((item) => {
            item.project_id = properties?.['project_id'];
            item.version_no = properties?.['version_no'];
            return item;
        });

        propertiesData['language_inheritance'] = res['data']['languages_inheritance'].map((item) => {
            item.project_id = properties?.['project_id'];
            return item;
        });

        propertiesData['language_inheritance_tree'] = JSON.parse(
            res?.['data']?.['properties'][0]?.['language_inheritance_tree']
        );

        const checkDate = res?.['data']?.['properties'][0]?.['due_date'];
        const checkDates = checkDate.split('T');
        let deliveryDate;
        if (checkDates[0] !== '1900-01-01') {
            deliveryDate = res?.['data']?.['properties'][0]?.['due_date'];
        } else {
            deliveryDate = null;
        }

        this.projectService.setBaseFileState({
            projectName: res?.['data']?.['properties'][0]?.['title'],
            brand: res?.['data']?.['properties'][0]?.['brand_id'],
            type: res?.['data']?.['properties'][0]?.['project_type'],
            placeholderDefination: res?.['data']?.['properties'][0]?.['placeholder'],
            projectDescription: res?.['data']?.['properties'][0]?.['description'],
            finalDelivery: deliveryDate !== null ? new Date(deliveryDate) : null,
            projectFlow: 'properties',
        });

        const state = {
            properties: {
                ...this.getPropertiesPayload(properties, res['data']),
                language_mapping: propertiesData['language_mapping'],
                language_inheritance: propertiesData['language_inheritance'],
                language_inheritance_tree: propertiesData['language_inheritance_tree'],
            },
            projectData: res['data'],
        };
        this.projectService.setPropertiesState(state);
    }

    getPropertiesPayload(projectProperties, projectData) {
        const propertiesData = {};
        const propertiesPayload = {
            existing_project_id: projectProperties?.['existing_project_id']?.trim(),
            title: projectProperties?.['title'],
            group_node_count: projectProperties?.['group_node_count'],
            brand_id: projectProperties?.['brand_id'],
            project_type: projectProperties?.['project_type'],
            editor_language: projectProperties?.['editor_language'],
            translation_role: projectProperties?.['translation_role'],
            project_manager_email: projectProperties?.['project_manager_email'],
            project_manager_id: projectProperties?.['project_manager_id'],
            placeholder: projectProperties?.['placeholder'],
            label_id: projectProperties?.['label_id'],
            due_date: projectProperties?.['due_date'],
            description: projectProperties?.['description'],
            text_node_count: projectProperties?.['text_node_counts'],
            creator: projectProperties?.['creator'],
            project_id: projectProperties?.['project_id'],
            parent_project_id: projectProperties?.['parent_project_id'],
            version_no: projectProperties?.['version_no'],
            user_id: this.userService.getUser()?.id,
            isProjectUpdateInProgress: false,
            readOnlyUsers: projectProperties?.readOnlyUsers,
        };

        propertiesData['project_properties'] = propertiesPayload;
        const lcAndFont = projectData.lc_and_font[0];
        propertiesData['project_metadata'] = {
            lengthCalculationIds: lcAndFont?.lengthCalculationIds,
            font_id: lcAndFont?.font_id,
        };

        return propertiesData;
    }
}
