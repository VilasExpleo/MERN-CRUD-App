import { Component } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { DialogService } from 'primeng/dynamicdialog';
import { ScreenshotsComponent } from './screenshots/screenshots.component';
@Component({
    selector: 'app-references',
    templateUrl: './references.component.html',
    styleUrls: ['./references.scss'],
})
export class ReferencesComponent {
    isScreenshotEmbedded = true;
    screenshotTitle = '';

    constructor(private dialogService: DialogService, private eventBus: NgEventBus) {}

    screenshotHeaderTitle(title: string) {
        this.screenshotTitle = title;
    }

    showScreenshotsDialog() {
        const dialogRef = this.dialogService.open(ScreenshotsComponent, {
            header: this.screenshotTitle,
            contentStyle: { overflow: 'auto', padding: '0rem', background: '#f8f9fa' },
            draggable: true,
            resizable: true,
            closable: true,
            style: {
                'min-width': '500px',
                'min-height': '450px',
            },
        });
        this.isScreenshotEmbedded = false;

        dialogRef.onResizeEnd.subscribe(() => {
            this.eventBus.cast('screenShot:drawImage');
        });

        dialogRef.onClose.subscribe(() => {
            this.isScreenshotEmbedded = true;
        });
    }
}
