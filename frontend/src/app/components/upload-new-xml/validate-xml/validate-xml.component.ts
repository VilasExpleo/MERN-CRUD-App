import { Component, OnInit } from '@angular/core';
import { UploadxmlService } from 'src/app/core/services/xml/uploadxml/uploadxml.service';
import * as converter from 'xml-js';

@Component({
    selector: 'app-validate-xml',
    templateUrl: './validate-xml.component.html',
    styleUrls: ['./validate-xml.component.scss'],
})
export class ValidateXmlComponent implements OnInit {
    fileName = '';
    statusMessage = '';
    errorMessage = '';
    error = '';
    id = '';
    xmlError = '';

    constructor(private uploadXmlService: UploadxmlService) {}
    ngOnInit(): void {
        this.fileName = '';
    }
    // HMI xml parser code start

    getFileExtension(fileName: any) {
        return fileName != '' && fileName != undefined && fileName != null ? fileName.split('.').pop() : '';
    }

    selectFile(event: any) {
        const file: File = event.target.files[0];
        this.fileName = event.target.value;
        if (this.getFileExtension(file.name) != 'xml') {
            alert('Wrong XML');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const xml = e.target.result;
            const resultData = converter.xml2json(xml, { compact: true, spaces: 2 });
            const JSONData: any = JSON.parse(resultData);

            const projectName = JSONData.SupplierXML.Project._attributes.Name;
            const data = {
                project_name: projectName,
            };
            this.uploadXmlService.checkProjectName(data).subscribe(
                (res) => {
                    const projectData = JSON.stringify(res);
                    const jsonObj = JSON.parse(projectData);
                    this.error = jsonObj.message;
                    this.id = jsonObj.data;
                },
                (error) => {
                    this.error = error.message;
                }
            );
            this.uploadXmlService.validateXml('validate-xml', JSONData).subscribe((xmlData: any) => {
                if (xmlData.status === 'OK') {
                    this.statusMessage = xmlData.message;
                } else {
                    this.errorMessage = xmlData.message;
                    this.xmlError = JSON.stringify(xmlData.error);
                }
            });
        };
        reader.readAsText(event.target.files[0]);
    }
}
