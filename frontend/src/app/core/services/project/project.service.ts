/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, Subject, catchError, combineLatest, map, of, take } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { ProjectManagerDashboardTransformer } from 'src/app/components/dashboard/project-manager-dashboard/project-manager-dashboard.transformer';
import { EditablePropertiesModel } from 'src/app/components/project/components/properties/editable-properties.model';
import { EditablePropertiesTransformer } from 'src/app/components/project/components/properties/editable-properties.transformer';
import { LcAndFontModel } from 'src/app/components/project/components/resources/lc-and-fonts/lc-and-fonts.model';
import { GrammarParserModel } from 'src/app/components/project/components/resources/parser-config/parser-config-item/parser-config.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { CreateProjectRequestModel } from 'src/app/shared/models/project/create-project-request.model';
import { BrandModel, UserSettingsModel } from 'src/app/shared/models/project/user-request.model';
import { UserResponseModel } from 'src/app/shared/models/project/user-response.model';
import { UploadRequestModel } from 'src/app/shared/models/resource/resource-file-upload-request.model';
import { ApiService } from '../api.service';
import { MappingService } from '../mapping/mapping.service';
import { StcActionService } from '../sample-text-catalog-service/stc-action.service';
import { UserService } from '../user/user.service';
@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    constructor(
        private api: ApiService,
        private objStcActionService: StcActionService,
        private objMappingService: MappingService,
        private messageService: MessageService,
        private datePipe: DatePipe,
        private userService: UserService,
        private projectManagerDashboardTransformer: ProjectManagerDashboardTransformer,
        private editablePropertiesTransformer: EditablePropertiesTransformer
    ) {}
    projName;
    projectDetailsData = [];
    propertiesOfProjectData = [];
    finalData = [];
    metadata;
    projectDetail;
    displayStepDialoge;
    displayPrepareDialog;
    finalProjectDetails = {
        previousXmlData: [],
        selectBaseFile: [],
        projectInfoDetails: [],
        languages: [],
        languageInheritance: [],
        propertiesOfProject: [],
        metadataOfProject: [],
        languageSetting: [],
        xmlFile: File,
        updatedXmlFile: File,
        fileUrl: '',
        langCount: '',
        uuid: '',
        groupNodeCount: '',
        textNodeCount: '',
        variantCount: '',
        variants: [],
    };

    updateProjectDetails: any = {
        projectTranslateID: '',
        newXmlFile: File,
        projectVersion: '',
        projectById: '',
        newProjectName: '',
        oldProjectName: '',
        newProjectDate: '',
        oldProjectDate: '',
        newProjectLanguages: '',
        oldProjectLanguages: '',
        newProjectVariants: '',
        oldProjectVariants: '',
        oldProjectTextNodeCount: '',
        oldProjectGroupNodeCount: '',
        newProjectTextNodeCount: '',
        newProjectGroupNodeCount: '',
        xml_difference: '',
        xmlDifferenceRes: '',
        languageDiffrence: '',
        oldLangCount: '',
        newLangCount: '',
        configuredOptions: '',
        checkedValues: '',
        groupnodeAdded: '',
        groupnodeDeleted: '',
        changedEntries: '',
        languageDeleted: '',
        textnodeDeleted: '',
        textnodeAdded: '',
        structureEntries: '',
        changeEntries: '',
    };

    defaultXmlDetails = {
        languages: [],
        xmlProjectDetails: [],
    };
    lengthCalculationIds: number[] = [];
    private projectNameFromXml = new BehaviorSubject<any>('Project Name');
    public projectName = this.projectNameFromXml.asObservable();

    // base file state
    private baseFileState = new BehaviorSubject<{
        uuid;
        langsFromXML;
        xmlFile;
        groupNodeCount;
        textNodeCount;
        variants;
        projectName;
        date;
        creator;
        projectDetails;
    }>(null);

    public baseFileState$ = this.baseFileState.asObservable();
    private closeProjectCreateDialog = new Subject<void>();

    closeProjectCreateDialog$ = this.closeProjectCreateDialog.asObservable();

    private lcAndFontState = new BehaviorSubject<LcAndFontModel>(null);
    private lcAndFontState$ = this.lcAndFontState.asObservable();

    private screenShotState = new BehaviorSubject<UploadRequestModel>(null);
    private screenShotState$ = this.screenShotState.asObservable();

    private parseConfigurationState = new BehaviorSubject<GrammarParserModel>(null);
    private parseConfigurationState$ = this.parseConfigurationState.asObservable();

    setLcAndFontState(value: LcAndFontModel): void {
        this.lcAndFontState.next(value);
    }

    getLcAndFontState(): Observable<LcAndFontModel> {
        return this.lcAndFontState$;
    }

    setScreenShotState(value): void {
        this.screenShotState.next(value);
    }

    getScreenShotState(): Observable<any> {
        return this.screenShotState$;
    }

    closeCreateDialog() {
        this.closeProjectCreateDialog.next();
    }

    setBaseFileState(val) {
        this.baseFileState.next(val);
    }

    getBaseFileState(): Observable<any> {
        return this.baseFileState$;
    }

    propertiesState = new BehaviorSubject<any>({});

    setPropertiesState(data) {
        this.propertiesState.next(data);
    }

    getPropertiesState(): Observable<any> {
        return this.propertiesState.asObservable();
    }

    setParseConfigurationState(value: GrammarParserModel): void {
        this.parseConfigurationState.next(value);
    }

    getParseConfigurationState(): Observable<GrammarParserModel> {
        return this.parseConfigurationState$;
    }

    getEditableProperties(): Observable<EditablePropertiesModel> {
        // TODO: Multiple states of the project is used during the project creation and properties.
        // Refactor to single state

        // 1. Below state is used to first step in create
        const properties$ = this.getBaseFileState();

        // 2. Below state is used for second step in create
        const properties2$ = this.getlangPropertiesState();

        // 3. Below state is used for second step in project properties
        const properties3$ = this.getPropertiesState();

        const brands$ = this.getBrands();
        const types$ = this.getTypes();

        return combineLatest([properties$, properties2$, properties3$, types$, brands$]).pipe(
            take(1),
            map(([properties, properties2, properties3, types, brands]) => {
                return this.editablePropertiesTransformer.transform(
                    properties,
                    properties2,
                    properties3?.properties?.project_properties,
                    types?.['data'],
                    brands?.['data'],
                    this.userService.getUser()
                );
            })
        );
    }

    // project properties state -- include checkbox state for now
    private langPropertiesState = new BehaviorSubject<{
        projectName;
        brand;
        project_type;
        mainDefinitionPlaceHolder;
        finalDelivery;
        description;
    }>(null);

    public langPropertiesState$ = this.langPropertiesState.asObservable();

    setlangPropertiesState(val) {
        this.langPropertiesState.next(val);
    }

    getlangPropertiesState(): Observable<any> {
        return this.langPropertiesState$;
    }
    //user state
    private usersSettingState = new BehaviorSubject<UserSettingsModel>(null);
    public UserSettingState$ = this.usersSettingState.asObservable();

    setUserSettingState(value: UserSettingsModel) {
        this.usersSettingState.next(value);
    }

    getUserSettingState(): Observable<UserSettingsModel> {
        return this.UserSettingState$;
    }

    // language setting state
    private LangSettingState = new BehaviorSubject<{
        mappedLangs: any[];
        translationLanguage;
    }>(null);

    public LangSettingState$ = this.LangSettingState.asObservable();

    setLangSettingState(val) {
        this.LangSettingState.next(val);
    }

    getLangSettingState(): Observable<any> {
        return this.LangSettingState$;
    }

    // language inheritance state
    private LangInheritanceState = new BehaviorSubject<any>(null);
    public LangInheritanceState$ = this.LangInheritanceState.asObservable();

    setLangInheritanceState(val) {
        this.LangInheritanceState.next(val);
    }

    getLangInheritanceState(): Observable<any> {
        return this.LangInheritanceState$;
    }

    // meta data state
    private metaDataState = new BehaviorSubject<{
        lengthCalculationsOfVectorFonts;
        defaultFontPackages;
        metaData;
        metadataObj;
        lcFontValidation;
    }>(null);
    public metaDataState$ = this.metaDataState.asObservable();

    setMetaDataState(val) {
        this.metaDataState.next(val);
    }

    getMetaDataState(): Observable<any> {
        return this.metaDataState$;
    }

    setProjectName(name: string) {
        this.projName = name;
    }

    getProjectName() {
        return this.projName;
    }

    setProjectUpdateDetailsData(data) {
        this.updateProjectDetails.newXmlFile = data.newXml;
        this.updateProjectDetails.projectVersion = data.projectVersion;
        this.updateProjectDetails.projectById = data.projectById;
        this.updateProjectDetails.newProjectName = data.newProjectName;
        this.updateProjectDetails.oldProjectName = data.oldProjectName;
        this.updateProjectDetails.newProjectDate = data.newProjectDate;
        this.updateProjectDetails.oldProjectDate = data.oldProjectDate;
        this.updateProjectDetails.newProjectLanguages = data.newProjectLanguages;
        this.updateProjectDetails.oldProjectLanguages = data.oldProjectLanguages;
        this.updateProjectDetails.newProjectVariants = data.newProjectVariants;
        this.updateProjectDetails.oldProjectVariants = data.oldProjectVariants;
        this.updateProjectDetails.xml_difference = data.xml_difference;
        this.updateProjectDetails.xmlDifferenceRes = data.xmlDifferenceRes;
        this.updateProjectDetails.languageDiffrence = data.languageDiffrence;
        this.updateProjectDetails.oldLangCount = data.oldLangCount;
        this.updateProjectDetails.newLangCount = data.newLangCount;
        this.updateProjectDetails.configuredOptions = data.configuredOptions;
        this.updateProjectDetails.groupnodeAdded = data.groupnodeAdded;
        this.updateProjectDetails.groupnodeDeleted = data.groupnodeDeleted;
        this.updateProjectDetails.changedEntries = data.changedEntries;
        this.updateProjectDetails.languageDeleted = data.languageDeleted;
        this.updateProjectDetails.textnodeDeleted = data.textnodeDeleted;
        this.updateProjectDetails.textnodeAdded = data.textnodeAdded;
        this.updateProjectDetails.checkedValues = data.checkedValues;
        this.updateProjectDetails.oldProjectGroupNodeCount = data.oldProjectGroupNodeCount;
        this.updateProjectDetails.oldProjectTextNodeCount = data.oldProjectTextNodeCount;
        this.updateProjectDetails.newProjectGroupNodeCount = data.newProjectGroupNodeCount;
        this.updateProjectDetails.newProjectTextNodeCount = data.newProjectTextNodeCount;
        this.updateProjectDetails.structureEntries = data.structureEntries;
        this.updateProjectDetails.changeEntries = data.changeEntries;
        this.updateProjectDetails.textnodeChangeEntries = data.textnodeChangeEntries;
        this.updateProjectDetails.thresholdValues = data.thresholdValues;
    }
    getProjectUpdateDetailsData() {
        return this.updateProjectDetails;
    }
    /** this function maintain state for project creation */
    setProjectDetails(data) {
        this.projectDetailsData = data;
        this.finalProjectDetails.selectBaseFile = data.selectBaseFile;
        this.finalProjectDetails.projectInfoDetails = data.projectInfoDetails;
        this.finalProjectDetails.languages = data.languages;
        this.finalProjectDetails.languageInheritance = data.languageInheritance;
        this.finalProjectDetails.propertiesOfProject = data.propertiesOfProject;
        this.finalProjectDetails.metadataOfProject = data.metadataOfProject;
        this.finalProjectDetails.languageSetting = data.languageSetting;
        // this.setLngSttngFinalData(data.languageSetting)
        this.finalProjectDetails.fileUrl = data.fileUrl;
        this.finalProjectDetails.previousXmlData = data.previousXmlData;
        this.finalProjectDetails.langCount = data.langCount;
        this.finalProjectDetails.xmlFile = data.xmlFile;
        this.finalProjectDetails.updatedXmlFile = data.updatedXmlFile;
        this.finalProjectDetails.uuid = data.uuid;
        this.finalProjectDetails.groupNodeCount = data.groupNodeCount;
        this.finalProjectDetails.textNodeCount = data.textNodeCount;
        this.finalProjectDetails.variantCount = data.variantCount;
        this.finalProjectDetails.variants = data.variants;
    }
    /** this function get brands from api*/
    getBrands() {
        return this.api.getTypeRequest('project-properties/brand', {});
    }
    /** this function get types from api */
    getTypes() {
        return this.api.getTypeRequest('project-properties/type', {});
    }

    getPlaceholders() {
        return this.api.getTypeRequest('project-properties/placeholder-symbol', {});
    }

    /** this function get role from api */
    getRole() {
        return this.api.getTypeRequest('project-properties/translation-role', {});
    }

    getReadOnlyUsers(url: string, payload: BrandModel): Observable<UserResponseModel[]> {
        return this.api.postTypeRequest(url, payload).pipe(
            catchError(() => of({ data: [] })),
            map((response: ApiBaseResponseModel) => response?.data)
        );
    }
    // TODO: Remove userId from here and handle from calling function
    getProjectsFromDB(url: string) {
        return this.api.postTypeRequest(url, { user_id: this.userService.getUser().id });
    }

    getTranslationRequests(url: string) {
        return this.api.postTypeRequest(url, { user_id: this.userService.getUser().id }).pipe(
            // TODO: handle the case when response is NOK
            map((response) => this.projectManagerDashboardTransformer.transform(response))
        );
    }

    getProjectDetails() {
        return this.finalProjectDetails;
    }

    setPropertiesOfProject(data) {
        this.propertiesOfProjectData.push(data);
    }

    getPropertiesOfProject() {
        return this.propertiesOfProjectData;
    }

    setDefaultXmlProperties(data) {
        this.defaultXmlDetails = data;
    }

    checkProjectName(projectName): Observable<object> {
        return this.api.postTypeRequest('datavalidation', projectName);
    }
    // POST Project Creation Data To Server
    createProject(data) {
        return this.api.postTypeRequest('project-create/new', data);
    }
    /** this function set data in state*/
    setProjectMetadata(data) {
        this.metadata = data;
    }
    /** this function get data in state*/
    getProjectMetadata() {
        return this.metadata;
    }
    /** this function upload file project fonts Length Calculations of vector fonts */
    uploadMetaData(data) {
        const url = `project-create/uploads`;
        return this.api.postTypeRequest(url, data);
    }
    setCloseDialoge(data) {
        this.displayStepDialoge = data;
    }
    getCloseDialoge() {
        return false;
    }

    getProjectProgressDetails(url, id) {
        return this.api.postTypeRequest(url, id);
    }

    /** Start Update Project */
    editProject(id) {
        const url = `project-list/${id}`;
        return this.api.getTypeRequest(url, {});
    }
    updateProjectData(data) {
        return this.api.postTypeRequest('project-update', data);
    }
    /** End Update Project */

    /** Start delete abort Project */
    deleteProjectByID(url) {
        return this.api.deleteTypeRequest(url, {});
    }
    deleteProjectOnReject(url) {
        return this.api.deleteTypeRequest(url, {});
    }
    abortProjectOnReject(url, id) {
        return this.api.postTypeRequest(url, id);
    }
    /** this function execute project Mass operation */
    executeMassoperation(data) {
        const url = `execute-massoperation`;
        return this.api.postTypeRequest(url, data);
    }
    /** this function accept project MassOperation*/
    acceptMassOperation(id) {
        const url = `project-create/accept`;
        return this.api.postTypeRequest(url, id);
    }
    /** End delete abort Project */

    // translate service GET
    getTranslateTableLayout(id) {
        const url = `user-table-layout/project_id/${id}`;
        return this.api.getTypeRequest(url, {});
    }

    // translate service POST
    postTranslateTableLayout(data) {
        const url = `user-table-layout/create`;
        return this.api.postTypeRequest(url, data);
    }

    //schedule mass operation
    postScheduleMassOperation(data) {
        const url = `schedule-project`;
        return this.api.postTypeRequest(url, data);
    }

    // get projects by user base
    getProject(id) {
        const url = `project-list/${id}`;
        return this.api.getTypeRequest(url, {});
    }

    // get Project Update XML diffrence data
    getXmlDiffrence(data) {
        const url = `project-update/get-xml-difference`;
        return this.api.postTypeRequest(url, data);
    }

    // POST project update data to server
    updateProject(data) {
        const url = `project-update/new-import`;
        return this.api.postTypeRequest(url, data);
    }

    // unique ID check for project update
    projectUpdateDatavalidation(data) {
        const url = `datavalidation/validate-id`;
        return this.api.postTypeRequest(url, data);
    }

    // schedule project update
    postScheduleProjectUpdate(data) {
        const url = `project-update/schedule-project-update`;
        return this.api.postTypeRequest(url, data);
    }

    //update metadata from view project properties
    updateMetadata(data) {
        const url = `project-update/update-project-metadata`;
        return this.api.postTypeRequest(url, data);
    }

    //download metadata from view project properties
    downloadMetadata(data) {
        const url = `project-list/aws/download`;
        return this.api.postTypeRequest(url, data);
    }

    //get prperties for font mapping
    getFontmappingData(data) {
        const url = `project-fonts/font_mapping`;
        return this.api.postTypeRequest(url, data);
    }

    //post font mapping data
    postFontmappingData(data) {
        const url = `project-fonts/update_font`;
        return this.api.postTypeRequest(url, data);
    }

    //recalculation
    postRecalculationData(data) {
        const url = `project-update/recalculate`;
        return this.api.postTypeRequest(url, data);
    }

    // get system fonts from server
    getSystemFonts() {
        const url = `project-fonts/system-fonts`;
        return this.api.getTypeRequest(url, {});
    }

    // get length calculation for width of progress bar
    getLengthCalculation(data) {
        const url = `calculate-length/getLength`;
        return this.api.postTypeRequest(url, data);
    }
    //get total text nodes for tabular
    getTotalTextNodes(url, id) {
        return this.api.postTypeRequest(url, id);
    }

    getLengthCalculationsList() {
        const url = `project-create/getlcdetails`;
        return this.api.getTypeRequest(url, {});
    }
    getFontList() {
        const url = `project-create/getfontdetails`;
        return this.api.getTypeRequest(url, {});
    }

    //get group node count and text node count from DB
    getNodeCount(data) {
        const url = `project-update/get-xml-details`;
        return this.api.postTypeRequest(url, data);
    }

    // save translation text value and change status
    changeAndSaveTranslationStatus(data) {
        const url = `tabular-format/save_status`;
        return this.api.postTypeRequest(url, data);
    }

    setProjectParameters(id, version, title, language, tid, role) {
        const data = {
            id: id,
            version: version,
            editorLanguageCode: language,
            title: title,
            translationRequestId: tid,
            role: role,
        };
        localStorage.setItem('requestData', JSON.stringify(data));
    }

    getProjectParameters() {
        if (localStorage.getItem('requestData')) {
            const value = localStorage.getItem('requestData');
            return JSON.parse(value);
        }
    }
    projectOverview(id): Observable<object> {
        return this.api.postTypeRequest('project-list/project-overview', id);
    }
    /** this function execute duplicate project */
    duplicateProject(data) {
        const url = `project-create/duplicate-project`;
        return this.api.postTypeRequest(url, data);
    }
    // set text node status to lock/unlock
    lockUnlockTextNode(data) {
        const url = `tabular-format/lock_state`;
        return this.api.postTypeRequest(url, data);
    }
    // save unicode
    saveUnicode(data) {
        const url = `tabular-format/save_status`;
        return this.api.postTypeRequest(url, data);
    }

    createIdealText(data) {
        const url = `project-mapping/create-mapped-idealstc`;
        return this.api.postTypeRequest(url, data);
    }

    createIdealTextByTranslator(data) {
        const url = `translator-tree-format/create-ideal-text`;
        return this.api.postTypeRequest(url, data);
    }
    createShortFormByTranslator(data) {
        const url = `translator-tree-format/create-short-form`;
        return this.api.postTypeRequest(url, data);
    }
    checkShortFormByTranslator(data) {
        const url = `translator-tree-format/check-short-form`;
        return this.api.postTypeRequest(url, data);
    }

    createIdealTextFromTranslation(
        selectedRow,
        translationRequestId,
        projectTranslateID,
        versionNumber,
        variantId,
        arrayItemIndex,
        user,
        requestFrom,
        role,
        state,
        tableData = null
    ) {
        let parent_stc_id = 0;
        if (requestFrom === 'table') {
            parent_stc_id = this.getParentStcidForTable(tableData);
        } else {
            parent_stc_id = this.getParentStcid(selectedRow);
        }
        const createIdealTextPayload: any = {};
        if (role === 'editor') {
            createIdealTextPayload.brand_id = user.getUser().brand_id;
            createIdealTextPayload.editor_id = user.getUser().id;
            createIdealTextPayload.parent_stc_id = parent_stc_id;
            createIdealTextPayload.textnode_language_id = selectedRow['data']['language_id'];
            createIdealTextPayload.ideal_text = selectedRow['data']['translation'];
            createIdealTextPayload.project_id = Number(projectTranslateID);
            createIdealTextPayload.version_id = versionNumber;
            createIdealTextPayload.textnode_id = selectedRow['data']['ID'] || selectedRow['data']['TextNodeId'];
            createIdealTextPayload.variant_id = variantId;
            createIdealTextPayload.array_item_index = arrayItemIndex;
            createIdealTextPayload.state = this.getMappingTextState(state);
            this.createIdealText(createIdealTextPayload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    if (res?.['status'] === 'OK') {
                        if (requestFrom === 'table') {
                            tableData.language_data.find(
                                (item) => item.language_id === selectedRow['data']['language_id']
                            ).parent_stc_id = parent_stc_id;
                        } else {
                            selectedRow['data']['parent_stc_id'] = parent_stc_id;
                        }
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
                    }
                });
        } else if (role === 'translator') {
            createIdealTextPayload.translation_request_id = translationRequestId;
            createIdealTextPayload.translator_id = user.getUser().id;
            createIdealTextPayload.parent_stc_id = parent_stc_id;
            createIdealTextPayload.language_id = selectedRow['data']['language_id'];
            createIdealTextPayload.ideal_text = selectedRow['data']['translation'];
            createIdealTextPayload.project_id = Number(projectTranslateID);
            createIdealTextPayload.version_id = versionNumber;
            createIdealTextPayload.text_node_id = selectedRow['data']['ID'] || selectedRow['data']['TextNodeId'];
            createIdealTextPayload.variant_id = variantId;
            createIdealTextPayload.array_item_index = arrayItemIndex;
            createIdealTextPayload.state = this.getMappingTextState(state);
            this.createIdealTextByTranslator(createIdealTextPayload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    if (res?.['status'] === 'OK') {
                        if (requestFrom === 'table') {
                            tableData[selectedRow['data']['lang_code'] + '_parent_stc_id'] = parent_stc_id;
                        } else {
                            selectedRow['data']['parent_stc_id'] = parent_stc_id;
                        }
                    }
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
                });
        }
    }

    getParentStcid(selectedRow) {
        let parent_stc_id = 0;
        if (selectedRow?.['data']?.['parent_stc_id'] > 0) {
            parent_stc_id = selectedRow['data']['parent_stc_id'];
        } else {
            if (
                selectedRow?.['parent']?.['data']?.['Type'] === '_' ||
                selectedRow?.['parent']?.['data']?.['Type'] === 'Module' ||
                selectedRow?.['parent']?.['data']?.['Type'] === 'Root'
            ) {
                parent_stc_id = selectedRow?.['children'].find((item) => item['data']['parent_stc_id'] > 0)?.['data']?.[
                    'parent_stc_id'
                ];
            } else {
                if (selectedRow?.['parent']?.['data']?.['parent_stc_id'] === '_') {
                    parent_stc_id = selectedRow['parent']['children'].find(
                        (item) => item['data']['parent_stc_id'] > 0
                    )?.['data']?.['parent_stc_id'];
                } else {
                    parent_stc_id = selectedRow?.['parent']?.['data']?.['parent_stc_id'];
                }
            }
        }
        return parent_stc_id ?? 0;
    }

    createShortFormFromTranslation(
        selectedRow,
        translationRequestId,
        projectTranslateID,
        versionNumber,
        variantId,
        arrayItemIndex,
        user,
        allAvailableShortForms,
        messageService,
        requestFrom,
        role,
        state,
        tableData = null
    ) {
        if (role === 'editor') {
            const payload = {
                stc_id: selectedRow['data'].stc_master_id,
                editor_id: user.getUser().id,
                existing_short_form: allAvailableShortForms,
                new_short_form: [{ short_form: selectedRow['data']['translation'] }],
            };
            this.objStcActionService
                .updateStcDataRequest('stc-master/update-shortform', payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    if (res) {
                        const update_mapping_paylod = {
                            project_id: Number(projectTranslateID),
                            version_id: versionNumber,
                            editor_id: user.getUser().id,
                            textnode_id: selectedRow['data']['ID'] || selectedRow['data']['TextNodeId'],
                            variant_id: variantId,
                            array_item_index: arrayItemIndex,
                            stc_master_id: selectedRow['data'].stc_master_id,
                            textnode_language_id: selectedRow['data']['language_id'],
                            stc_shortform_id: res?.['shortform_ids'][0],
                            flag: 'update_shortform',
                            state: this.getMappingTextState(state),
                        };
                        this.objMappingService
                            .saveMappingData(`project-mapping/update-mapping-data`, update_mapping_paylod)
                            .subscribe((response) => {
                                if (response['status'] === 'Ok') {
                                    messageService.add({
                                        severity: 'success',
                                        summary: 'Success',
                                        detail: response['message'],
                                    });
                                    if (requestFrom === 'table') {
                                        tableData.language_data.find(
                                            (item) => item.language_id === selectedRow['data']['language_id']
                                        ).stc_shortform_id = res['shortform_ids'][0];
                                    } else {
                                        selectedRow['data']['stc_shortform_id'] = res['shortform_ids'][0];
                                    }
                                } else {
                                    messageService.add({
                                        severity: 'warn',
                                        summary: 'Warning',
                                        detail: response['message'],
                                    });
                                }
                            });
                    }
                });
        } else if (role === 'translator') {
            const payload = {
                project_id: Number(projectTranslateID),
                version_id: versionNumber,
                parent_stc_id: selectedRow['data']['parent_stc_id'],
                translation_request_id: translationRequestId,
                stc_id: selectedRow['data'].stc_master_id,
                translator_id: user.getUser().id,
                short_form: selectedRow['data']['translation'],
                language_id: selectedRow['data']['language_id'],
                state: this.getMappingTextState(state),
            };

            this.createShortFormByTranslator(payload).subscribe((response) => {
                if (response['status'] === 'OK') {
                    messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response['message'],
                    });
                    if (requestFrom === 'table') {
                        tableData[selectedRow['data']['lang_code'] + '_stc_shortform_id'] = response['shortform_id'];
                    } else {
                        selectedRow['data']['stc_shortform_id'] = response['shortform_id'];
                    }
                } else {
                    messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: response['message'],
                    });
                }
            });
        }
    }
    getParentStcidForTable(tableData) {
        return tableData.language_data.find((item) => item.parent_stc_id > 0)?.parent_stc_id || 0;
    }
    // get project update configuration data
    getProjectUpdateConfiguration(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    versionHistory(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    public exportExcel(data, fileName) {
        import('xlsx').then((xlsx) => {
            data.map((item) => {
                item.updated_on = this.datePipe.transform(item.updated_on, 'yyyy-MM-dd, hh:mm:ss a');
                delete item.changed_by;
                delete item.created_by;
                delete item.editor_id;
                delete item.existing_project_id;
                delete item.Id;
                delete item.attribute_id;
                delete item.project_id;
                delete item.version_id;
                delete item.variant_id;
                delete item?.action_taken_by;
                delete item?.action;
                delete item?.array_item_index;
                delete item?.message;
                delete item?.language_id;
                delete item?.created_on;
                delete item?.translation_request_id;
                return item;
            });
            const worksheet = xlsx.utils.json_to_sheet(this.getHistoryHeader(data, fileName));
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, fileName);
        });
    }

    public saveAsExcelFile(buffer, fileName: string): void {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(data, fileName + '_export_' + EXCEL_EXTENSION);
    }

    getSelectedProjectData(project, row) {
        const data = {
            projectId: project?.projectId,
            version: project?.versionId,
            projectName: project?.projectName,
            translationRequestId: project.translationRequestId ?? project.id,
            proofreaderSourceLanguage: project?.sourceLanguage?.code ?? project.sourceLanguage,
            proofreaderLangCode: row?.targetLanguage?.code ?? row?.targetLanguageCode,
            proofreaderLangId: row?.targetLanguage?.id,
            role: this?.userService?.getUser()?.role,
            userProps: this?.userService?.getUser(),
            reviewerLangCode: row?.targetLanguageCode,
            reviewerLangId: row?.targetLanguageId,
            gpConfigIds: row?.gpConfigIds ?? [],
        };
        if (data.role === Roles.reviewer) {
            data['reviewType'] = project.reviewType;
        }
        localStorage.setItem('projectProps', JSON.stringify(data));
    }

    getProjectProperties() {
        if (localStorage.getItem('projectProps')) {
            const value = localStorage.getItem('projectProps');
            return JSON.parse(value);
        }
    }

    getMappingTextState(state) {
        return state === 'Done' ? 'Done' : 'Work in progress';
    }

    private getHistoryHeader(data, fileName) {
        switch (fileName) {
            case 'Project_Version_History':
                return data.map(({ title, mass_operation_type, updated_on, version_name, user_name }) => ({
                    'Project Name': title,
                    Description: mass_operation_type,
                    Date: updated_on,
                    'Version Name': version_name,
                    'Editor Name': user_name,
                }));
            case 'Stc_History':
                return data.map(
                    ({ stc_id, language_code, attribute_name, old_value, new_value, updated_on, user_name }) => ({
                        'STC ID': stc_id,
                        Language: language_code,
                        'Changed Attributes': attribute_name,
                        'Old Value': old_value,
                        'New Value': new_value,
                        Timestamp: updated_on,
                        User: user_name,
                    })
                );
            default:
                return data.map(
                    ({ text_node_id, language_code, attribute_name, old_value, new_value, updated_on, user_name }) => ({
                        'Textnode Id': text_node_id,
                        Language: language_code,
                        'Changed Attributes': attribute_name,
                        'Old Value': old_value,
                        'New Value': new_value,
                        Timestamp: updated_on,
                        User: user_name,
                    })
                );
        }
    }

    getProjectCreatePayload(projectDetails): CreateProjectRequestModel {
        const projectProperties = projectDetails.properties.project_properties;
        const projectData = projectDetails.projectData;
        const metaData = projectDetails.properties.project_metadata;
        return {
            existing_project_id: projectProperties.existing_project_id,
            title: projectProperties.title,
            group_node_count: projectProperties.group_node_count,
            brand_id: projectProperties.brand_id,
            project_type: projectProperties.project_type,
            editor_language: projectProperties.editor_language,
            placeholder: JSON.stringify(projectProperties.placeholder),
            translation_role: projectProperties.translation_role,
            label_id: 1,
            due_date: projectProperties.due_date
                ? this.datePipe.transform(projectProperties.due_date, 'YYYY-MM-dd')
                : '',
            description: projectProperties.description,
            text_node_counts: projectProperties.text_node_count,
            creator: projectProperties.creator,
            parent_project_id: 0,
            user_id: projectProperties.user_id,
            status: 'new',
            is_metadata: 0,
            variant: projectDetails.projectData.properties[0].variant,
            font_id: metaData.font_id,
            lengthCalculationIds: JSON.stringify(metaData.lengthCalculationIds),
            project_manager_id: projectProperties?.project_manager_id,
            project_manager_email: projectProperties?.project_manager_email,
            language_mapping: JSON.stringify(projectData.languages),
            language_inheritance: JSON.stringify(projectData.languages_inheritance),
            language_inheritance_tree: JSON.stringify(projectData.languages_inheritance),
            rawProjectId: projectProperties.project_id,
        };
    }
}
