import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgEventBus } from 'ng-event-bus';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { MenubarModule } from 'primeng/menubar';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { ExportModule } from './components/export/export.module';
import { LengthCalculationAndFontsModule } from './components/length-calculation-and-fonts/length-calculation-and-fonts.module';
import { LoginModule } from './components/login/login.module';
import { ReportsModule } from './components/Reports/reports.module';
import { SampleTextCatalogModule } from './components/sample-text-catalog/sample-text-catalog.module';
import { SettingsModule } from './components/settings/settings.module';
import { UploadNewXmlModule } from './components/upload-new-xml/upload-new-xml.module';
import { HttpAuthInterceptor } from './core/interceptors/http-auth.interceptor';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { GlobalErrorHandler } from './core/services/error-handler/global-error-handler.service';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { HeaderComponent } from './shared/layout/header/header.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { RawProjectModule } from './components/raw-project/raw-project.module';

@NgModule({
    declarations: [AppComponent, LayoutComponent, HeaderComponent, FooterComponent],
    providers: [
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpAuthInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorInterceptor,
            multi: true,
        },
        DatePipe,
        NgEventBus,
        DialogService,
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        PanelModule,
        LoginModule,
        DashboardModule,
        MenubarModule,
        BrowserAnimationsModule,
        ToastModule,
        RippleModule,
        AvatarModule,
        DialogModule,
        ButtonModule,
        FileUploadModule,
        UploadNewXmlModule,
        BadgeModule,
        SampleTextCatalogModule,
        SettingsModule,
        ExportModule,
        LengthCalculationAndFontsModule,
        DynamicDialogModule,
        ReportsModule,
        RawProjectModule,
    ],
})
export class AppModule {}
