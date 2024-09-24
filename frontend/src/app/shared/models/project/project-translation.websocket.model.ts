export interface LengthCalculationModel {
    type: string;
    content: WebsocketContent[];
}

export interface WebsocketContent {
    method: string;
    widths: TextWidthModel[];
    success: string;
    error?: string;
}

export interface TextWidthModel {
    text: string;
    width: number;
}
