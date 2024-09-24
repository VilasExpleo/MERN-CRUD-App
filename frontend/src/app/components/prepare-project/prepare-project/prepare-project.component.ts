import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { MessageService } from 'primeng/api';
import { Subscription, catchError, of } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { SampleXmlService } from 'src/app/core/services/xml/sample-xml/sample-xml.service';
import { DashboardComponent } from '../../dashboard/editor/dashboard.component';
const zip = new JSZip();

@Component({
    selector: 'app-prepare-project',
    templateUrl: './prepare-project.component.html',
    styleUrls: ['./prepare-project.component.scss'],
})
export class PrepareProjectComponent implements OnInit {
    displayPrepareDialog = false;
    displayStepDialoge = false;
    error!: string;
    projectname!: string;
    showProjectError = true;
    loading = false;
    prjName;
    uuid;
    zipData = [];
    readme;
    subscriptions: Subscription;
    version = '1.0';
    creator = 'HMIL Linguist Software';
    constructor(
        private messageService: MessageService,
        private service: SampleXmlService,
        private httpClient: HttpClient,
        private router: Router,
        private projectService: ProjectService,
        private dashboardComponent: DashboardComponent
    ) {}

    ngOnInit(): void {
        this.displayPrepareDialog = this.projectService.getCloseDialoge();
    }
    prepareConfirm() {
        this.error = '';
        this.messageService.clear();
        this.dashboardComponent.closePrepareDialog();
        this.displayPrepareDialog = false;
        this.showProjectError = true;
        this.projectname = '';
        if (this.projectname != '') {
            this.error = '';
            this.messageService.clear();
        }
    }
    // Prepare Project name checking
    async checkProjectName(projectname: any) {
        this.prjName = projectname;
        const data = {
            project_name: this.prjName,
        };
        if (this.projectname !== '') {
            await this.service.checkProjectName(data).subscribe(
                (res) => {
                    const projectData = JSON.stringify(res);
                    const jsonObj = JSON.parse(projectData);
                    if (jsonObj.data != undefined || jsonObj.data != null) {
                        this.uuid = jsonObj.data.uuid;
                    }
                    if (jsonObj.status == 'OK') {
                        this.showProjectError = false;
                        this.error = '';
                    } else if (jsonObj.status == 'NOK') {
                        this.showProjectError = true;
                        this.error = `Project name "${this.prjName}" is not available for use and currently is being used. Please use a different project Name.`;
                    }
                },
                (error) => {
                    this.error = error.message;
                }
            );
        }
        if (this.projectname == '') {
            this.showProjectError = true;
            this.error = '';
        }
    }
    //create zip file
    createZip(data: any, filename: any, filedata: any, readmeData: any) {
        zip.forEach((file) => {
            zip.remove(file);
        });
        zip.file(filename, filedata);
        const readmefileData = readmeData.res.replace('HelloWorld', this.prjName);
        zip.file(readmeData.newFilename, readmefileData);
        data.forEach((element) => {
            zip.file('xsd/' + element.newFilename, element.res);
        });
        zip.file('sds/' + 'put your project specific sds files here', '');
        zip.file('screenshots/' + 'put your project specific screenshots files here', '');
        zip.file('lengthcalculations/' + 'put your project specific length calculation files here', '');
        zip.file('fonts/' + 'put your project specific font files here', '');
        zip.file('docs/' + 'put your project specific documentation files here', '');
        zip.file('bfonts/' + 'put your project specific bitmap font files here', '');
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, this.prjName + '.zip');
        });
    }
    //read XSD files
    async readXSDfile(filename: any, data: any) {
        const xsdfile = [
            'assets/prepare-project/XSD_Schemas/Comment.xsd',
            'assets/prepare-project/XSD_Schemas/Common.xsd',
            'assets/prepare-project/XSD_Schemas/Constraint.xsd',
            'assets/prepare-project/XSD_Schemas/Dependencies.xsd',
            'assets/prepare-project/XSD_Schemas/GroupNode.xsd',
            'assets/prepare-project/XSD_Schemas/Label.xsd',
            'assets/prepare-project/XSD_Schemas/Language.xsd',
            'assets/prepare-project/XSD_Schemas/Placeholder.xsd',
            'assets/prepare-project/XSD_Schemas/Project.xsd',
            'assets/prepare-project/XSD_Schemas/TextNode.xsd',
            'assets/prepare-project/XSD_Schemas/TextNodeRef.xsd',
            'assets/prepare-project/XSD_Schemas/Variant.xsd',
            'assets/prepare-project/XSD_Schemas/Verification.xsd',
        ];
        xsdfile.forEach(async (file) => {
            await this.httpClient
                .get(file, {
                    responseType: 'text',
                })
                .subscribe((res) => {
                    // eslint-disable-next-line no-useless-escape
                    const newFilename = file.replace(/^.*[\\\/]/, '');
                    const response = {
                        newFilename: newFilename,
                        res: res,
                    };
                    this.zipData.push(response);
                });
        });

        const readme = 'assets/prepare-project/README.md';
        await this.httpClient
            .get(readme, {
                responseType: 'text',
            })
            .subscribe((res) => {
                // eslint-disable-next-line no-useless-escape
                const newFilename = readme.replace(/^.*[\\\/]/, '');
                this.readme = {
                    newFilename: newFilename,
                    res: res,
                };
            });

        setTimeout(() => {
            this.createZip(this.zipData, filename, data, this.readme);
        }, 1000);
    }
    // download prepare project xml file as per project name
    downloadPrepareProject() {
        this.error = '';
        this.projectname = '';
        this.dashboardComponent.closePrepareDialog();
        this.showProjectError = true;
        this.loading = false;
        this.subscriptions = this.httpClient
            .get('assets/prepare-project/superhmi.xml', {
                responseType: 'text',
            })
            .pipe(catchError(() => of(undefined)))
            .subscribe((data) => {
                if (data) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data, 'text/xml');
                    xmlDoc.getElementsByTagName('Project')[0].setAttribute('Name', this.prjName);
                    xmlDoc
                        .getElementsByTagName('Project')[0]
                        .setAttribute('DataCreationDate', new Date().toISOString().split('.')[0]);
                    xmlDoc.getElementsByTagName('Project')[0].setAttribute('DataFormatVersion', this.version);
                    xmlDoc.getElementsByTagName('Project')[0].setAttribute('Creator', this.creator);
                    xmlDoc.getElementsByTagName('Project')[0].setAttribute('Id', this.uuid);
                    const filename = this.prjName + '.xml';
                    const projectJsonXml = new XMLSerializer().serializeToString(xmlDoc.documentElement);
                    this.readXSDfile(filename, projectJsonXml);
                    setTimeout(() => (this.loading = false), 2000);
                }
            });
    }
}
