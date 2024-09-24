import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RawProjectManageTextnodesComponent } from './raw-project-manage-textnodes.component';
import { Spy } from 'jest-auto-spies';
import { ActivatedRoute } from '@angular/router';
import { RawProjectTextnodeService } from 'src/app/core/services/data-creator/raw-project-textnode.service';
import { MessageService } from 'primeng/api';
import { RawProjectTextnodeAvailableOptionsTransformer } from './transformer/raw-project-textnode-available-options.transformer';
import { ApiService } from 'src/app/core/services/api.service';
import { RawProjectService } from 'src/app/core/services/data-creator/raw-project.service';
import { RawProjectManageTextNodesTransformer } from './raw-project-manage-textnodes.transformer';
import { RawProjectTextnodeCreateRequestTransformer } from './transformer/raw-project-textnode-create-request.transformer';
import { RawProjectTextnodeCreateResponseTransformer } from './transformer/raw-project-textnode-create-response.transformer';
import { RawProjectTextnodeListResponseTransformer } from './transformer/raw-project-textnode-list-response.transformer';
import { RawProjectTextnodeUpdateRequestTransformer } from './transformer/raw-project-textnode-update-request.transformer';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NodeTypeEnum } from 'src/app/shared/enums/node-type.enum';
import { NodeSubTypeEnum } from 'src/app/shared/enums/node-sub-type.enum';
import { InputTypeEnum } from 'src/app/shared/enums/input-type.enum';

describe('RawProjectManageTextnodesComponent', () => {
    let component: RawProjectManageTextnodesComponent;
    let fixture: ComponentFixture<RawProjectManageTextnodesComponent>;
    let mockRawProjectTextnodeService: Spy<RawProjectTextnodeService>;
    let mockMessageService: Spy<MessageService>;
    let mockRawProjectTextnodeAvailableOptionsTransformer: Spy<RawProjectTextnodeAvailableOptionsTransformer>;
    let mockApiService: Spy<ApiService>;
    let mockRawProjectTextnodeListResponseTransformer: Spy<RawProjectTextnodeListResponseTransformer>;
    let mockRawProjectTextnodeCreateRequestTransformer: Spy<RawProjectTextnodeCreateRequestTransformer>;
    let mockRawProjectTextnodeUpdateRequestTransformer: Spy<RawProjectTextnodeUpdateRequestTransformer>;
    let mockRawProjectTextnodeCreateResponseTransformer: Spy<RawProjectTextnodeCreateResponseTransformer>;
    let mockRawProjectService: Spy<RawProjectService>;
    let mockRawProjectManageTextNodesTransformer: Spy<RawProjectManageTextNodesTransformer>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RawProjectManageTextnodesComponent],
            providers: [
                { provide: ApiService, useValue: mockApiService },
                { provide: RawProjectManageTextNodesTransformer, useValue: mockRawProjectManageTextNodesTransformer },
                { provide: RawProjectService, useValue: mockRawProjectService },
                {
                    provide: RawProjectTextnodeCreateResponseTransformer,
                    useValue: mockRawProjectTextnodeCreateResponseTransformer,
                },
                {
                    provide: RawProjectTextnodeUpdateRequestTransformer,
                    useValue: mockRawProjectTextnodeUpdateRequestTransformer,
                },
                {
                    provide: RawProjectTextnodeCreateRequestTransformer,
                    useValue: mockRawProjectTextnodeCreateRequestTransformer,
                },
                {
                    provide: RawProjectTextnodeListResponseTransformer,
                    useValue: mockRawProjectTextnodeListResponseTransformer,
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ rawProjectId: 6 }),
                    },
                },
                { provide: RawProjectTextnodeService, useValue: mockRawProjectTextnodeService },
                { provide: MessageService, useValue: mockMessageService },
                {
                    provide: RawProjectTextnodeAvailableOptionsTransformer,
                    useValue: mockRawProjectTextnodeAvailableOptionsTransformer,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(RawProjectManageTextnodesComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set rawProject value', () => {
        expect(component.rawProjectId).toBe(6);
    });

    const groupRowNode = {
        node: {
            key: 132,
            rawProjectId: 5,
            parentId: 0,
            positionInParent: 0,
            nodeSubType: NodeSubTypeEnum.StandardGroup,
            nodeType: NodeTypeEnum.Group,
            name: 'LC1',
            source: '',
            variantId: 5,
            maxWidth: null,
            maxLength: null,
            maxLines: null,
            lengthCalculationId: 2,
            lineBreakMode: 'Manual',
            fontId: 99,
            editMode: false,
            children: [
                {
                    key: 183,
                    rawProjectId: 5,
                    parentId: 132,
                    positionInParent: 132,
                    nodeSubType: NodeSubTypeEnum.MetaText,
                    nodeType: NodeTypeEnum.Textnode,
                    name: '123',
                    source: '23',
                    variantId: 202,
                    maxWidth: 2,
                    maxLength: 22,
                    maxLines: 22,
                    lengthCalculationId: 2,
                    lineBreakMode: 'Manual',
                    fontId: 99,
                    editMode: false,
                    children: [],
                },
            ],
            parent: null,
        },
        parent: null,
        level: 0,
        visible: true,
    };

    it('should return true if node is group', () => {
        expect(component.isNodeTypeGroupAndNotEditMode(groupRowNode)).toBe(true);
    });

    it('should return false if column is not single selection', () => {
        const mockConfig = { field: 'name', type: InputTypeEnum.Text };
        expect(component.isTextNodeNotSingleSelection(mockConfig, groupRowNode)).toBe(false);
    });

    it('should return true if column is single selection', () => {
        groupRowNode.node.nodeType = NodeTypeEnum.Textnode;
        const mockConfig = {
            field: 'lineBreakMode',
            type: InputTypeEnum.SingleSelect,
            optionLabel: 'name',
            optionValue: 'code',
            options: [
                { code: 'Word', name: 'Word' },
                { code: 'Manual', name: 'Manual' },
            ],
        };
        expect(component.isTextNodeSingleSelection(mockConfig, groupRowNode)).toBe(true);
    });
});
