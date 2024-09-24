export interface TestBedResponseModel {
    defaultFont: DefaultFontModel;
    defaultTexts: string[];
}

export interface DefaultFontModel {
    fontName: string;
    fontPath: string;
    fontSize: number;
    fontType: string;
}

export interface LcDropDownModel {
    lcName: string;
    lcPath: string;
}

export interface WebsocketResponseModel {
    type: string;
    content: WebsocketContentModel[];
}

export interface WebsocketContentModel {
    text?: string;
    width?: number;
    lcName?: string;
    error?: string[];
    errorType?: string;
}
