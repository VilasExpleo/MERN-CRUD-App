import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { XmlProjectCreationService } from 'src/app/core/services/xml/xml-project-creation/xml-project-creation.service';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as converter from 'xml-js';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-xml-project',
    templateUrl: './xml-project.component.html',
    styleUrls: ['./xml-project.component.scss'],
    providers: [DatePipe],
})
export class XmlProjectComponent implements OnInit {
    currentDate = new Date();
    createxmlForm!: UntypedFormGroup;
    projectname!: string;
    submitted = false;
    link;
    XSDLink = 'Download Sample XSD Archive';
    xmlProjectLink = false;
    xmlFile;
    error!: string;
    xmlData;
    projectnewName = [];
    projectDetails = [];
    loading = false;
    version = '1.0';
    creator = 'HMIL Linguist Software';
    uuid;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private httpClient: HttpClient,
        private service: XmlProjectCreationService
    ) {}

    ngOnInit(): void {
        this.createxmlForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
        });
    }

    get createFormControl() {
        return this.createxmlForm.controls;
    }

    // project name checking
    async CheckProjectName(projectname: any) {
        const data = {
            project_name: projectname,
        };
        await this.service.checkProjectName(data).subscribe(
            (res) => {
                const projectData = JSON.stringify(res);

                const jsonObj = JSON.parse(projectData);
                this.uuid = jsonObj.data.uuid;

                this.error = jsonObj.message;
            },
            (error) => {
                this.error = error.message;
            }
        );
    }

    // projectname link showing wether project name is available
    onSubmit(projectname: any) {
        if (this.createxmlForm.valid) {
            if (this.error === 'Project name is available') {
                this.xmlProjectLink = !this.xmlProjectLink;
                this.link = projectname + '.xml';
            } else {
                this.xmlProjectLink = !this.xmlProjectLink;
                this.link = '';
                this.XSDLink = '';
            }
        }
    }
    // download xml file as per project name
    download() {
        this.loading = true;
        this.httpClient
            .get('assets/files/superhmi.xml', {
                responseType: 'text',
            })
            .subscribe((data) => {
                const result1 = converter.xml2json(data, { compact: true, spaces: 2 });
                const JSONData: any = JSON.parse(result1);
                JSONData.SupplierXML.Project._attributes.Name = this.projectname;
                JSONData.SupplierXML.Project._attributes.DataCreationDate = this.currentDate;
                JSONData.SupplierXML.Project._attributes.DataFormatVersion = this.version;
                JSONData.SupplierXML.Project._attributes.Creator = this.creator;
                JSONData.SupplierXML.Project._attributes.Id = this.uuid;
                const projectJsonXml = converter.json2xml(JSONData, { compact: true, spaces: 2 });
                const zip = new JSZip();
                const filename = this.projectname + '.xml';
                // create a zipfile
                zip.file(filename, projectJsonXml);
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    saveAs(content, 'XSD_supplier.zip');
                });
                setTimeout(() => (this.loading = false), 2000);
            });
    }
    // download xsd file
    downloadXSD() {
        this.loading = true;
        setTimeout(() => (this.loading = false), 2000);
    }
}
