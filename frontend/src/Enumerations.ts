/*
    Enumerations thet will be used in the application
    Enum int value is returned by e.g. StatusEnum.New
    Retunns 1
    Enum string value is returned by e.r. StatusEnum[StatusEnum.New]
    Returns "New"
*/

export enum ResponseStatusEnum {
    OK = 'OK',
    NOK = 'NOK',
}

export enum BrandLogo {
    SEAT = '../../../../assets/images/symbol/star-o.svg',
    VW_11 = '../../../../assets/images/symbol/star-o.svg',
}

export enum Status {
    'Unworked' = '#495057',
    'Done' = '#1EA97C',
    'Work in progress' = '#CD9A23',
    'Pending' = '#696CFF',
    'Approved' = '#1EA97C',
    'Rejected' = '#FF5757',
    'New' = '#696CFF',
    'Expired' = '#FF5757',
    'Closed' = '#1EA97C',
    'In-progress' = '#CC8925',
    'Unresolved font' = '#FFd9d1',
    'Unresolved Chars' = '#FF655D',
}
export enum TranslationStatusEnum {
    'Unworked' = 1,
    'Work in progress' = 2,
    'Done' = 3,
    'Unresolved Font' = 4,
    'Length Error' = 5,
    'Placeholder Error' = 6,
}
export enum TextNodeStatus {
    'New' = 1,
    'Pending' = 2,
    'Approved' = 3,
    'Rejected' = 4,
    'Closed' = 5,
    'In-progress' = 6,
    'Expired' = 7,
}
export enum ProjectProofreadStatus {
    New = 1,
    Closed = 5,
    InProgress = 6,
    Expired = 7,
}
export enum ProofreadStatus {
    'pi pi-star' = 1,
    'pi pi-check-circle' = 5,
    'pi pi-spinner' = 6,
    'pi pi-clock' = 7,
}
export enum TranslationViewStatus {
    approved = 'approved',
    pending = 'pending',
    rejected = 'rejected',
}
export enum CheckStatus {
    PENDING = 'PENDING',
    DONE = 'DONE',
}
export enum StatusKey {
    'New' = 1,
    'InAssignment' = 2,
    'Assigned' = 3,
    'In Translation' = 4,
    'Translated' = 5,
    'Expired' = 0,
    'Rejected' = 6,
}

export enum Tab {
    'Comment',
    'References',
}

export const TranslationRequestStatus = {
    New: 1,
    InAssignment: 2,
    Assigned: 3,
    InTranslation: 4,
    Translated: 5,
    Rejected: 6,
};

export const ReviewRequestStatus = {
    new: 1,
    inProgress: 6,
    closed: 5,
    expired: 7,
};

export enum GroupnodeType {
    'Module' = 'icon-Group-module',
    '_' = 'pi pi-folder',
    'StandardGroup' = 'pi pi-folder',
    'Project' = 'pi pi-folder',
    'Root' = 'pi pi-folder',
    'Widget' = 'icon-group-widget1',
    'View' = 'icon-group-view',
    'Ddb' = 'icon-text-node-ddb',
    'ConcatText' = 'icon-concatenate',
    'Teleprompter' = 'icon-teleprompter',
    'List' = 'icon-list',
}

export enum TextnodeType {
    '_' = 'icon-text-node-meta-text',
    'StandardText' = 'icon-text-node-meta-text',
    'DisplayText' = 'icon-text-node-meta-text',
    'SdsCommand' = 'icon-group',
    'SdsPrompt' = 'pi pi-volume-up',
    'SdsText' = 'icon-sds-text',
    'ConcatString' = 'icon-concatenate',
    'MetaText' = 'icon-meta-text1',
}
export enum Type {
    DisplayText = 'DisplayText',
    SDSCommand = 'SDSCommand',
    SDSPrompt = 'SDSPrompt',
    MetaText = 'MetaText',
}
export enum STCType {
    DisplayText = 1,
    SdsCommand = 2,
    SdsPrompt = 3,
}

export enum NodeType {
    './assets/images/symbol/standard-group-open.svg' = 1,
    './assets/images/symbol/standard-group-close.svg' = 2,
    './assets/images/symbol/Text-node.svg' = 3,
}

export enum TranslationRoleEnum {
    Constrained = 1,
    Unconstrained = 2,
}

export enum LockStatusEnum {
    Unlocked = 0,
    Locked = 1,
}

export enum TranslationRequestStatusEnum {
    New = 1,
    AssignedTranslationManager = 2,
    AssignedTranslator = 3,
    AssignedProofreader = 4,
    ReadyForTranslator = 5,
    ReadyForTranslationManager = 6,
    ReadyForProjectManager = 7,
    ReadyForEditor = 8,
    Completed = 9,
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
}
export enum GenderVal {
    Male = 1,
    Female = 2,
}

export enum Numerous {
    Singular = 'Singular',
    Plural = 'Plural',
}
export enum NumerousVal {
    Singular = 1,
    Plural = 2,
}

export enum Mapped {
    Yes = 'Yes',
    No = 'No',
}

export enum editorIcons {
    './assets/images/symbol/mappedlink.svg' = 9,
}

export enum tableIcons {
    'Length Error' = 'icon-lenght-cal',
    'Unresolved Chars' = './assets/images/symbol/unresolved.svg',
    'Work in progress' = 'pi pi-circle-fill Work',
    'Done' = 'pi pi-circle-fill Done',
    'ID 123' = 'pi pi-ticket label',
    // 'Yes' = "pi pi-link text-primary",
    'Locked' = 'pi pi-lock',
    'Project Creation Changes' = 'pi pi-tag labelHeade label',
    'Missing font' = '',
    'Error' = 'pi pi-exclamation-triangle text-red-400',
    'Error limit' = '',
    'Proof Read OK' = 'pi pi-check-square',
    'Review OK' = 'pi pi-star-fill',
    'Proof Read NOK' = '',
    'Error Unresolvedchar' = '',
    'Ddb' = '',
    'ConcatString' = 'icon-text-node---concat',
    'SdsCommand' = 'icon-group label',
    'SdsText' = 'icon-sds-text label',
    'SdsPrompt' = 'pi pi-volume-up label',
    'Review NOK' = '',
    'Unworked' = 'pi pi-circle-fill unworked-icon Unworked',
    'DisplayText' = 'icon-text-node-meta-text label',
    'StandardText' = 'icon-text-node-meta-text label',
    'property_name' = 'label',
    'user' = 'pi pi-user label',
    'Unresolved font' = './assets/images/symbol/error_font.svg',
    'Approved' = 'icon-pending',
    'Pending' = 'icon-pending',
    'Rejected' = 'icon-pending',
    'Placeholder Error' = 'pi pi-exclamation-triangle text-red-400',
    'MetaText' = 'icon-meta-text1',
}

export enum tableStatus {
    'Proof Read OK' = 'text-node-status-table',
    'Review OK' = 'text-node-status-table',
    'Proof Read NOK' = 'text-node-status-table',
    'Review NOK' = 'text-node-status-table',
    'source_text' = 'textWrap',
    'Unworked' = 'text-node-status-table',
    'Work in progress' = 'text-node-status-table',
    'Done' = 'text-node-status-table',
    'Locked' = 'text-node-status-table',
    'Unlocked' = 'text-node-status-table',
    'Length Error' = 'text-node-status-table',
    'Unresolved Chars' = 'text-node-status-table',
    'Error' = 'text-node-status-table',
    'Unresolved font' = 'text-node-status-table',
    'Placeholder Error' = 'text-node-status-table',
}

export enum Roles {
    editor = 1,
    translator = 2,
    proofreader = 3,
    reviewer = 4,
    projectmanager = 5,
    translationmanager = 6,
    supplier = 7,
    readonly = 8,
    datacreator = 9,
    helpcreator = 10,
}
export enum UsersRoles {
    Editor = 1,
    Translator = 2,
    Proofreader = 3,
    Reviewer = 4,
    Projectmanager = 5,
    Translationmanager = 6,
    Supplier = 7,
    Readonly = 8,
    Datacreator = 9,
    Helpcreator = 10,
}

export enum UnresolvedSymbols {
    'Unresolved font' = './assets/images/symbol/error_font.svg',
    'Unresolved Chars' = './assets/images/symbol/unresolved.svg',
}

export enum TableActionValue {
    maxRows = 50,
    previous = 0,
    middle = 1,
    next = 2,
}

export const TranslationViewType = {
    structure: 'structure',
    table: 'table',
};

export const TableHeaders = {
    Proofread: 'Proofread',
    Review: 'Review',
    Text: 'Text',
};

export const TranslationImportStatusEnum = {
    TranslationImport: 'translation import',
    //more status values
};
export enum NavigationTypes {
    TextNode = 'textnode',
    Unfinished = 'unfinished',
    FirstLast = 'firstlast',
    Proofread = 'proofread',
    Reviewer = 'reviewer',
    View = 'view',
    Exception = 'exception',
}
export enum Direction {
    Next = 'next',
    Previous = 'previous',
    ToLast = 'tolast',
    ToFirst = 'tofirst',
}
export enum TranslationStatus {
    Approved = 'Approved',
    Pending = 'Pending',
    Rejected = 'Rejected',
    Done = 'Done',
    Unworked = 'Unworked',
    WorkInProgress = 'Work in progress',
    UnResolvedFont = 'Unresolved font',
    Error = 'Error',
}

export enum TableContextMenu {
    Report = 'Report',
}

export enum ReportPanelSource {
    Dashboard = 'dashboard',
    Settings = 'settings',
}

export enum MassOperation {
    PROJECT_CREATION = 'Project Creation',
    PROJECT_UPDATE = 'Project Update',
    MAPPING_ASSISTANT = 'Mapping Assistant',
    NEW_VERSION = 'Project New Version',
    TRANSLATION_REQUEST = 'Translation Request',
    PROJECT_EXPORT = 'Project Export',
    PROJECT_PROPERTY_UPDATE = 'Project Properties Update',
    TRANSLATION_IMPORT = 'Translation Import',
    PROJECT_RECALCULATION = 'Project Recalculation',
    SCHEDULE_PROJECT = 'Schedule Project',
    REVIEW_REQUEST = 'Review Request',
}

export enum TextType {
    StandardText = 'Standard text',
    MetaText = 'Meta Text',
    TextNodeArray = 'Text Node Array',
    ConcatString = 'Concat String',
    SdsText = 'Sds Text',
    SdsPrompt = 'Sds Prompt',
    SdsCommand = 'Sds Command',
    TextTypeUser = 'Text type user',
}

export enum CommentFlavor {
    SYSTEM = 'System',
    GENERAL = 'General',
    REVIEW = 'Review',
    PROOFREAD = 'Proofread',
    EDITORIAL = 'Editorial',
}

export enum SampleTextAttributes {
    Gender = 'Gender',
    STCType = 'STC Type',
    IdealText = 'Ideal Text',
    Numerous = 'Numerous',
    Description = 'Description',
    ShortForm = 'Short Form',
    Brand = 'Brand',
    ID = 'ID',
    Type = 'Text Type',
}

export enum ReportFormat {
    XML = 'XML',
    XLSX = 'XLSX',
    TEXT = 'TEXT',
    HTML = 'HTML',
}

export enum TextState {
    Locked = 'Locked',
    Unlocked = 'Unlocked',
}

export enum TranslationHistoryAttributes {
    Status = 'Status',
    Translation = 'Translation Text',
}

export enum SelectedTreeNodeType {
    Structure = 'structure',
}

export enum LabelAssignType {
    TextNode = 'TextNode',
    GroupNode = 'GroupNode',
    Translation = 'Translation',
    Project = 'Project',
}

export enum LogLevel {
    Warning = 'Warning',
    Error = 'Error',
}

export enum NodeLevelType {
    Parent = 'Parent',
    Children = 'Children',
    View = 'View',
}

export enum OverlayHeaders {
    reviewComment = 'Review Comment',
    proofreadComment = 'Proofread Comment',
    rejectReason = 'Reason For Rejection',
}

export enum TranslationRequestsStatusEnum {
    New = 1,
    InAssignment = 2,
    Assigned = 3,
    InTranslation = 4,
    Translated = 5,
    Rejected = 6,
}

export enum TranslationRequestsStatusIconEnum {
    'pi pi-star' = 1,
    'pi pi-times-circle' = 6,
}

export enum OrderStatus {
    New = 'New',
    InAssignment = 'InAssignment',
    Assigned = 'Assigned',
    InTranslation = 'In Translation',
    Translated = 'Translated',
    Expired = 'Expired',
}

export enum ReportTabNameEnum {
    History = 'history',
}

export enum ProjectStatusEnum {
    OK = 'OK',
    UpdateAvailable = 'Update Available',
    Prepared = 'Prepared',
}

export enum NavigationTypesDisplayName {
    TextNode = 'Text Node',
    Unfinished = 'Unfinished',
    FirstLast = 'First Last',
    Proofread = 'Proofread Required',
    Reviewer = 'Review Required',
    View = 'View',
    Exception = 'Exception Node',
}

export enum TranslationSource {
    Source = 'Source',
    Translate = 'Translate',
}
