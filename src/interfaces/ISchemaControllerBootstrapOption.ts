import type { IAjvContainerOption } from '#/interfaces/IAjvContainerOption';
import type { IStringifyContainerOption } from '#/interfaces/IStringifyContainerOption';

export interface ISchemaControllerBootstrapOption {
  /** json-schema database file path */
  filePath: string;

  ajv?: IAjvContainerOption;

  stringify?: IStringifyContainerOption;
}
