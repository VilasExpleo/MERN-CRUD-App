import { ProjectProofreadStatus } from 'src/Enumerations';

export interface ProofreaderDashboardModel {
    projects: ProofreaderModel[];
}

//TODO To maintain camelCase
export interface ProofreaderModel {
    remainingTime: number;
    projectName: string;
    projectId: number;
    versionId: number;
    brandUrl: string;
    brandName: string;
    document: string;
    dueDate: Date;
    status: ProjectProofreadStatus;
    translationRequestId: number;
    sourceLanguage: Language[];
    languages: ProofreaderRequest[];
    description?: string;
    lcPath?: string;
    fontPath?: string;
}

export interface ProofreaderRequest {
    translatorId: number;
    translatorName: string;
    progress: number;
    pendingNodes: number;
    totalNodes: number;
    proofreadNodes: number;
    targetLanguage: Language[];
    returnDate?: Date;
}

export interface Language {
    id: number;
    code: string;
}
export interface OrderStatus {
    id: string;
    label: string;
}
export interface TextNodeStatus {
    id: string;
    label: string;
    icon: string;
}

export interface ProofreadLanguageRow {
    translatorId: number;
    translatorName: string;
    targetLanguage: Language;
    progress: number;
    pendingNodes: number;
    totalNodes: number;
    proofreadNodes: number;
    totalWordCount: number;
    rejectedNodes: number;
}
