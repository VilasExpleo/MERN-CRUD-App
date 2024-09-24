import { Component } from '@angular/core';
import { LengthCalculationService } from 'src/app/core/services/length-calculation-and-fonts/length-calculation.service';

@Component({
    selector: 'app-fonts',
    templateUrl: './fonts.component.html',
})
export class FontsComponent {
    constructor(public lengthCalculationService: LengthCalculationService) {}
}
