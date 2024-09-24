import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { LabelModel } from 'src/app/components/dashboard/label-manager/label.model';
import { LabelsService } from 'src/app/core/services/labels/labels.service';

@Component({
    selector: 'app-label-filter',
    templateUrl: './label-filter.component.html',
})
export class LabelFilterComponent implements OnInit {
    @Output()
    filter = new EventEmitter<any>();

    @Input()
    projectId: number;

    labels$: Observable<LabelModel[]>;

    constructor(private labelService: LabelsService) {}
    ngOnInit(): void {
        this.getLabels();
    }

    onFilter(event) {
        this.filter.emit(event);
    }

    getLabels() {
        this.labels$ = this.labelService.getLabels(this.projectId);
    }
}
