import type { AnySchemaObject } from 'ajv';

export interface ISchemaDatabaseItem {
  id: string;
  filePath?: string;
  $ref: string[];
  dto: boolean;
  schema: AnySchemaObject;
  rawSchema: string;
}
