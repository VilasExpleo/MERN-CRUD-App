export interface ScreenshotModel {
    dbTextNodeId: number;
    viewName: string;
    variantName: string;
    language?: string;
    url?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fallback?: boolean;
    errorMessage?: string;
}
