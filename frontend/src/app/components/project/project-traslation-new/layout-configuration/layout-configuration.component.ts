import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { LayoutconfigurationService } from 'src/app/core/services/layoutConfiguration/layoutconfiguration.service';

@Component({
    selector: 'app-layout-configuration',
    templateUrl: './layout-configuration.component.html',
})
export class LayoutConfigurationComponent {
    constructor(public layoutconfigurationService: LayoutconfigurationService, private ref: DynamicDialogRef) {}
    closeSaveLayoutDialog() {
        this.ref.close();
    }
}
