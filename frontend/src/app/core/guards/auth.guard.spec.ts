import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { AuthGuard } from './auth.guard';

describe('Auth guard', () => {
    let mockRouter: Spy<Router>;
    let mockAuthGuard: AuthGuard;
    let mockActivatedRouteSnapshot: Spy<ActivatedRouteSnapshot>;
    let mockState: Spy<RouterStateSnapshot>;
    let mockUserService: Spy<UserService>;

    beforeEach(() => {
        mockRouter = createSpyFromClass(Router);
        mockUserService = createSpyFromClass(UserService);
        mockState = createSpyFromClass(RouterStateSnapshot);
        mockState.url = '/mock-url';
    });

    const mockCurrentUser = {
        access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC1o.eyJzdWIiOjE4MiwiaWF0IjoxNjgyNjIyMjUzLCJleHAiOjE2ODI2MjU4NTN9.fNdIVreC-wQEq73IIny671T4Zi-sm2RQGkT4VFYxwiU',
        brand_id: 2,
        brand_name: 'VW_11',
        email: 'John.Smith@gmail.com',
        id: 100,
        name: 'John Smith',
        role: 5,
    };
    it('should return true if user is logged-in', () => {
        mockUserService.getUser.mockReturnValue(mockCurrentUser);
        mockAuthGuard = new AuthGuard(mockRouter, mockUserService);
        const isLoggedIn = mockAuthGuard.canActivate(mockActivatedRouteSnapshot, mockState);
        expect(isLoggedIn).toBeTruthy();
    });

    it('should return false if user is logged-out', () => {
        mockUserService.getUser.mockReturnValue(null);
        mockAuthGuard = new AuthGuard(mockRouter, mockUserService);
        const isLoggedIn = mockAuthGuard.canActivate(mockActivatedRouteSnapshot, mockState);
        expect(isLoggedIn).toBeFalsy();
    });

    it('should navigate user to login page', () => {
        mockUserService.getUser.mockReturnValue(null);
        mockAuthGuard = new AuthGuard(mockRouter, mockUserService);
        mockAuthGuard.canActivate(mockActivatedRouteSnapshot, mockState);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/mock-url' } });
    });
});
