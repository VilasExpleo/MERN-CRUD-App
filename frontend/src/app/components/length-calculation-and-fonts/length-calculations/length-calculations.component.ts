import { Component, OnInit } from '@angular/core';
import { LengthCalculationService } from 'src/app/core/services/length-calculation-and-fonts/length-calculation.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
    selector: 'app-length-calculations',
    templateUrl: './length-calculations.component.html',
    styleUrls: ['./length-calculations.component.scss'],
})
export class LengthCalculationsComponent implements OnInit {
    role;
    constructor(public lengthCalculationService: LengthCalculationService, private userService: UserService) {}

    ngOnInit() {
        this.role = this.userService.getUser()?.role;
    }
}
