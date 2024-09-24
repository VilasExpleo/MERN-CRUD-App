export class Term {
    termText: string | undefined;
    conceptId?: string;
    termbaseId?: string;
    score?: number;
    offsetStart?: number;
    offsetLength?: number;
}

export class ResponseTerm {
    text: string | undefined;
    termModelList: Term[] | undefined;
}
