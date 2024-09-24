export default interface TranslationImportReportModel {
    data: TranslationImportReportData;
}
//TODO: its same backend response format
export interface TranslationImportReportData {
    projectOverview: Overview;
    reportData: Report[];
}
export interface Report {
    languageCode: string;
    xmlLanguageCode: string;
    translatedAndImportable: TextNodeProperties[];
    translatedAndImportableWithRevision: TextNodeProperties[];
    translatedAndNotImportable: TextNodeProperties[];
    translatedAndConflicted: TextNodeProperties[];
    notTranslated: TextNodeProperties[];
    noChanges: TextNodeProperties[];
    sampleTextCatalogue: SampleTextCatalogue[];
}
export interface Overview {
    projectId: number;
    versionId: number;
    title: string;
    existingProjectId: string;
    brand: string;
    type: string;
    translationMode: string;
    description: string;
    creator: string;
    languages: string[];
    variants: string[];
    lengthCalculation: string;
    fonts: string[];
    groupNodeCount: number;
    textNodeCount: number;
}

export interface SampleTextCatalogue {
    id: string;
    old: SampleTextCatalogueAttribute;
    new: SampleTextCatalogueAttribute;
}
export interface TranslationImportReportPayload {
    projectId: number;
}
export interface TextNodeConstraints {
    lengthCalculation: string;
    font: string;
    maxWidth: number;
    maxLines: number;
    lineBreak: string;
    maxCharacter: number;
}
export interface Role {
    source: string;
    translation: string;
    status: string;
}
export interface TextNodeProperties {
    id: string;
    name: string;
    variant: string;
    listIndex: string;
    type: string;
    locked: string;
    editor: Role;
    translator: Role;
    old: TextNodeConstraints;
    new: TextNodeConstraints;
}
export interface SampleTextCatalogueAttribute {
    idealText: string;
    shortForm: string;
}
export interface ReportFields {
    field?: string;
    value?: string;
    displayField?: string;
    Attributes?: string;
    Project?: string;
}
export interface ImportReport {
    overviewData: ReportFields[];
    ExcelName: string;
}

export interface ProjectDetails {
    title: string;
    versionName: string;
    projectId: number;
}
export interface TextNodePropertiesReport {
    id: string;
    name: string;
    variant: string;
    listIndex: string;
    type: string;
    locked: string;
    editorsource: string;
    editortranslation: string;
    editorstatus: string;
    translatorsource: string;
    translatortranslation: string;
    translatorstatus: string;
    oldlengthCalculation: string;
    oldfont: string;
    oldmaxWidth: number;
    oldmaxLines: number;
    oldlineBreak: string;
    oldmaxCharacter: number;
    newlengthCalculation: string;
    newfont: string;
    newmaxWidth: number;
    newmaxLines: number;
    newlineBreak: string;
    newmaxCharacter: number;
}
export interface SampleTextCatalogReport {
    id: string;
    oldIdealText: string;
    oldShortForm: string;
    newIdealText: string;
    newShortForm: string;
}
export interface ExcelSheet {
    blob: Blob;
    fileName: string;
}
