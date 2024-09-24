import { UseCaseEnum } from '../../shared/enums/use-case.enum';

export interface RawProjectCheckUniquePropertiesValidatorModel {
    projectId: number;
    projectXmlId?: string;
    projectName?: string;
    useCase: UseCaseEnum;
}
