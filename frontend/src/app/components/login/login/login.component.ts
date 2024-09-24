import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isError = false;
    error: string;

    constructor(private userService: UserService, private formBuilder: UntypedFormBuilder, private router: Router) {}

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.email, Validators.required]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^(?=.*[0-9])' + '(?=.*[a-z])' + '(?=.*[@#$%^&+=])' + '(?=\\S+$).{8,20}$'),
                ],
            ],
        });
    }

    get formControl() {
        return this.loginForm.controls;
    }

    isFormInValid() {
        return this.loginForm.invalid;
    }

    login() {
        const userName = this.loginForm.controls['email'].value;
        const password = this.loginForm.controls['password'].value;
        this.userService.authenticate(userName, password).subscribe((response) => {
            this.handleResponse(response);
        });
    }

    private handleResponse(response) {
        switch (response.status) {
            case 'OK': {
                this.isError = false;
                this.userService.setCurrentUser(response);
                this.userService.navigateUserToDashboard(response.data.role);
                break;
            }

            case 'Unauthorized': {
                this.isError = true;
                this.error = 'Please enter a valid email and password';
                break;
            }

            default: {
                this.isError = true;
                this.error = response.message;
            }
        }
    }
}
