import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog';
import { ApiService } from '../api.service';
import { LocalStorageService } from '../storage/local-storage.service';
import { Roles } from '../../../../Enumerations';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(
        private apiService: ApiService,
        private localStorageService: LocalStorageService,
        private router: Router,
        private injector: Injector
    ) {}

    setCurrentUser(res: any) {
        // TODO: Need to check the model definition of response
        this.localStorageService.set('currentUser', JSON.stringify(res.data));
        this.localStorageService.set('token', res.data.token);
    }

    authenticate(email: string, password: string) {
        const body = {
            username: email,
            password: password,
        };
        return this.apiService.login('login', body);
    }

    getUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    logout() {
        this.localStorageService.clear();
        this.router.navigate(['']);
        this.closeAllDynamicDialogs();
    }

    private closeAllDynamicDialogs() {
        this.injector
            .get(DialogService)
            .dialogComponentRefMap.forEach((dialog: ComponentRef<DynamicDialogComponent>) => {
                dialog.destroy();
            });
    }

    navigateUserToDashboard(role: Roles) {
        switch (role) {
            case Roles.projectmanager: {
                this.router.navigate(['main/dashboard/projectmanager']);
                break;
            }

            case Roles.translationmanager: {
                this.router.navigate(['main/dashboard/translationmanager']);
                break;
            }

            case Roles.translator: {
                this.router.navigate(['main/dashboard/translator']);
                break;
            }

            case Roles.proofreader: {
                this.router.navigate(['main/dashboard/proofreader']);
                break;
            }

            case Roles.reviewer: {
                this.router.navigate(['main/dashboard/reviewer']);
                break;
            }

            case Roles.editor: {
                this.router.navigate(['main/dashboard']);
                break;
            }

            case Roles.datacreator: {
                this.router.navigate(['main/dashboard/datacreator']);
                break;
            }

            case Roles.helpcreator: {
                this.router.navigate(['main/dashboard/helpcreator']);
                break;
            }

            default:
                this.router.navigate(['main/error']);
        }
    }
}
