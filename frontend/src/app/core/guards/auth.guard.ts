import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user/user.service';
@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.userService.getUser()) {
            return true;
        }

        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}
