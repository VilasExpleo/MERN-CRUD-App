import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-help-icon',
    template: `<p-button
        icon="pi pi-question-circle"
        styleClass="p-button-secondary p-button-rounded p-button-text"
        pTooltip="help"
        tooltipPosition="bottom"
        (onClick)="navigateToHelp()"
    ></p-button>`,
})
export class HelpIconComponent {
    @Input() linkId = '';

    navigateToHelp() {
        const queryParams = { link: this.linkId };
        const queryString = new URLSearchParams(queryParams).toString();
        const newTabUrl = `/main/project-help?${queryString}`;
        window.open(newTabUrl, '_blank');
    }
}
