import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'FileIconImagePipe',
})
export class FileIconImagePipe implements PipeTransform {
    transform(fileName: string): string {
        const fileExtension = fileName.split('.').pop();
        let iconFolderPath = '../../../../assets/images/symbol/';

        switch (fileExtension) {
            case 'xlsx':
                iconFolderPath += 'microsoft-excel.svg';
                break;
            case 'csv':
                iconFolderPath += 'microsoft-excel.svg';
                break;
            case 'doc':
                iconFolderPath += 'microsoft-word.svg';
                break;
            case 'docx':
                iconFolderPath += 'microsoft-word.svg';
                break;
            case 'jpg':
                iconFolderPath += 'image.svg';
                break;
            case 'jpeg':
                iconFolderPath += 'image.svg';
                break;
            case 'png':
                iconFolderPath += 'image.svg';
                break;
            case 'pdf':
                iconFolderPath += 'pdf.svg';
                break;
            default:
                iconFolderPath += 'image.svg';
                break;
        }
        return iconFolderPath;
    }
}
