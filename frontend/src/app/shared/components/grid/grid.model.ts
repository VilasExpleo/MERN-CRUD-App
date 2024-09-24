export interface GridHeaderModel {
    field: string;
    header: string;
    sort?: boolean;
    filter?: FilterConfig | boolean;
    colSpan?: number;
}

export interface FilterConfig {
    type: string | Date | number;
    template?: { statuses: Status[] };
}

export interface GridModel {
    requests: RequestModel[];
    cols: GridHeaderModel[];
    colsForRowSpan?: GridHeaderModel[];
}

export interface Status {
    label: string;
    value: string;
}

//TODO To maintain camelCase
export interface RequestModel {
    id: number;
    projectName: string;
    versionId: number;
    version: number;
    dueDate: Date;
    sourceLanguage: string;
    status: number;
    document: string;
    targetLanguages: TargetLanguageRequestModel[];
    remainingTime: number;
    brandUrl?: string;
    proofread?: string;
    deliveryDate?: Date;
    returned?: string;
    documentCount: number;
    reviewType: string;
    lcPath?: string;
    fontPath?: string;
}

export interface TargetLanguageRequestModel {
    targetLanguageCode: string;
    targetLanguageId: number;
    progress: number;

    // Nodes are string as p-chip primeng component does not show the 0 value
    pendingNodes: number | string;
    approvedNodes: number | string;
    rejectedNodes: number | string;
    totalTextNodeCount: number;
    returnDate?: Date;
    proofreader?: string;
    translator?: string;
    reviewer?: string;
    doneNodes: number | string;
}
