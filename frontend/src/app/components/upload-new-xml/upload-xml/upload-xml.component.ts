import { Component, OnInit } from '@angular/core';
import { UploadxmlService } from 'src/app/core/services/xml/uploadxml/uploadxml.service';
import * as converter from 'xml-js';

@Component({
    selector: 'app-upload-xml',
    templateUrl: './upload-xml.component.html',
    styleUrls: ['./upload-xml.component.scss'],
})
export class UploadXmlComponent implements OnInit {
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
            this.uploadXmlService.uploadXml('new-xml', JSONData).subscribe((data: any) => {
                if (data.status === 'OK') {
                    this.statusMessage = data.message;
                } else {
                    this.errorMessage = data.message;
                    this.xmlError = JSON.stringify(data.error);
                }
            });
        };
        reader.readAsText(event.target.files[0]);
    }
}
