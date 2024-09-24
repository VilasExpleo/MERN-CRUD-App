import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';

@Component({
    selector: 'app-project-properties',
    templateUrl: './project-properties.component.html',
    styleUrls: ['./project-properties.component.scss'],
})
export class ProjectPropertiesComponent implements OnInit {
    index = 0;
    isFixedPropertiesDisabled = false;
    isRawProject = false;
    constructor(
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private projectPropertiesService: ProjectPropertiesService,
        private readonly router: Router
    ) {
        this.isRawProject = this.config.data?.isRawProject;
    }
    ngOnInit(): void {
        this.projectPropertiesService.setState(0);
        this.projectPropertiesService.propertiesIndex$.subscribe((index: number) => {
            this.index = index;
            if (index === 1 && this.isRawProject && !this.config.data?.isUpdate) {
                this.isFixedPropertiesDisabled = true;
            }
        });
    }

    closeDialog() {
        this.ref.close();
    }

    navigateToProjectHelp() {
        this.router.navigate(['main/project-properties-help'], { queryParams: { link: 'login_page' } });
        this.closeDialog();
    }
}
