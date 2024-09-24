/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { io } from 'socket.io-client';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { LocalStorageService } from 'src/app/core/services/storage/local-storage.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Roles, UsersRoles } from 'src/Enumerations';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [MessageService],
})
export class HeaderComponent implements OnInit {
    tieredItems: MenuItem[];
    toggle = false;
    appVersion = `${environment.appVersion}`;
    baseUrl = `${environment.apiUrl}`;
    userInfo;
    notificationCount;
    notificationArray = [];
    pageName;
    dashboardMenu: boolean;
    translateMenu: boolean;
    viewSetting = false;
    selectedProject;
    isMappingAssistent = false;
    urlWebSocket = `${environment.webSocket}`;
    isHelpCreator: boolean;
    constructor(
        private primengConfig: PrimeNGConfig,
        private messageService: MessageService,
        private userService: UserService,
        private notificationsService: NotificationsService,
        private router: Router,
        private localStorageService: LocalStorageService
    ) {
        this.isHelpCreator = this.userService.getUser()?.role === Roles.helpcreator;
        let url;
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                url = val.url;
                if (url !== '' && url !== '/') {
                    const urlData = url.split('/');
                    if (urlData[2] !== undefined) {
                        const pageName = urlData[2].includes('?') ? urlData[2].split('?')[0] : urlData[2];
                        this.setPageName(pageName);
                    }
                }
            }
        });
    }

    private setPageName(url: string) {
        switch (url) {
            case 'dashboard':
                this.pageName = 'Dashboard';
                break;
            case 'project-translation':
                this.pageName = 'Translate';
                break;
            case 'sample-text-catalog':
                this.pageName = 'Sample Text Catalog';
                break;
            case 'lengthcalculation-and-fonts':
                this.pageName = 'Length Calculation & Fonts';
                break;
            case 'raw-project-textnodes':
                this.pageName = 'Raw Project Data';
                break;
            case 'project-help':
                this.pageName = 'Help System';
                break;
            default:
                break;
        }
        this.onLoadSetMenu();
    }

    ngOnInit(): void {
        this.userInfo = this.userService.getUser();
        if (this.userInfo.role !== 1) {
            this.tieredItems?.[0]?.items?.splice(2, 1);
        }
        this.primengConfig.ripple = true;
        const socket = io(this.urlWebSocket, { transports: ['websocket'] });
        socket.on('connect', () => {
            socket.on('hmldata', (res) => {
                if (res[0]['progress'] == 100) {
                    this.getAllNotifications();
                }
            });
        });
        this.getAllNotifications();
    }

    getAllNotifications() {
        this.notificationsService.getNotifications({ user_id: this.userInfo.id }).subscribe((res: any) => {
            this.notificationCount = res.data.length != 0 ? res.data.length : '';
            this.notificationArray = res.data.slice(0, 5);
        });
    }
    showMultiple() {
        this.getAllNotifications();
        this.notificationArray.forEach((item) => {
            this.messageService.addAll([
                {
                    id: item.id,
                    severity: 'warn',
                    summary: item.project_name,
                    detail: item.notification_data,
                    sticky: true,
                    data: item.notification_type,
                },
            ]);
        });
    }

    onLoadSetMenu() {
        this.tieredItems = [
            {
                label: 'Global',
                icon: 'pi pi-fw pi-globe',
                visible: !this.isHelpCreator,
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-th-large',
                        command: () => this.dashboardPage(),
                        visible: this.pageName !== 'Dashboard',
                    },
                    {
                        label: 'Sample Text Catalog',
                        icon: 'pi pi-calendar',
                        command: () => this.sampleTextCatalogPage(),
                        visible: this.pageName !== 'Sample Text Catalog',
                    },
                    {
                        label: 'Length Calculation & Fonts',
                        icon: 'pi pi-chart-bar',
                        command: () => this.lengthcalculationPage(),
                        visible: this.pageName !== 'Length Calculation & Fonts',
                    },
                    {
                        label: 'Settings',
                        icon: 'pi pi-cog',
                        command: () => this.viewSettings(),
                    },
                ],
            },

            {
                label: 'Help',
                icon: 'pi pi-fw pi-envelope',
                visible: !this.isHelpCreator,
                items: [
                    {
                        label: 'Map',
                        icon: 'pi pi-fw pi-map-marker',
                    },
                ],
            },

            { separator: true },
            {
                label: 'Logout',
                icon: 'pi pi-fw pi-sign-out',
                command: () => this.logOut(),
            },
        ];
    }

    dashboardPage() {
        this.localStorageService.set('pageName', 'Dashboard');
        this.pageName = this.localStorageService.get('pageName');

        this.userService.navigateUserToDashboard(this.userInfo.role);
    }
    sampleTextCatalogPage() {
        this.router.navigate([`main/sample-text-catalog`]);
    }
    lengthcalculationPage() {
        this.router.navigate([`main/lengthcalculation-and-fonts`]);
    }

    removeNotification(data) {
        this.notificationsService
            .removeReadNotification(`notification-module/change_status`, {
                id: data.message.id,
                notification_type: data.message.data,
            })
            .subscribe((res) => {
                if (res['status'] == 'OK') {
                    if (this.notificationCount != 0) {
                        this.notificationCount = this.notificationCount - 1;
                    }
                    const result = this.notificationArray.findIndex((object) => {
                        return object['id'] === data['message']['id'];
                    });
                    this.notificationArray.splice(result, 1);
                }
            });
    }
    sendUserRole(num) {
        return UsersRoles[num];
    }

    logOut() {
        this.userService.logout();
        this.notificationArray = [];
    }

    viewSettings() {
        this.viewSetting = !this.viewSetting;
    }
    hideSetting() {
        this.viewSetting = !this.viewSetting;
    }
}
