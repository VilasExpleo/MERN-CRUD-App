import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
    selector: 'app-no-language',
    templateUrl: './no-language.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoLanguageComponent {
    @Input()
    headerText = 'No Language';

    @Input()
    buttonText = 'ok';

    @Input()
    isVisible = false;

    @Input()
    dialogBody = 'No Language Assigned to this project';

    @Output()
    closeEvent = new EventEmitter();

    toggle() {
        this.closeEvent.emit();
    }
}
