import { Component, OnInit } from '@angular/core';
import { LabelsService } from 'src/app/core/services/labels/labels.service';
import { LabelModel } from './label.model';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-label-manager',
    templateUrl: './label-manager.component.html',
})
export class LabelManagerComponent implements OnInit {
    labels: LabelModel[];
    isGrid = true;
    projectId: number;

    constructor(private readonly labelService: LabelsService, private readonly config: DynamicDialogConfig) {}

    ngOnInit(): void {
        this.projectId = this.config.data?.selectedProject?.project_id;
        this.getLabels();
    }

    showLabelForm() {
        this.isGrid = !this.isGrid;
    }

    showGrid() {
        this.isGrid = !this.isGrid;
        this.getLabels();
    }

    private getLabels() {
        this.labelService.getLabels(this.projectId).subscribe((response: LabelModel[]) => {
            this.labels = response;
        });
    }
}
