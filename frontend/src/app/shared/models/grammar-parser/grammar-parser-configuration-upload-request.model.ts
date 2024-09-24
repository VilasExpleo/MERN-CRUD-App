export interface GrammarParserConfigurationUploadRequestModel {
    projectId?: string;
    projectXmlId: string;
    fileType: string;
    configRole: string;
    userId: string;
    file: File;
}
