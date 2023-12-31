import type { AnySchemaObject } from 'ajv';

export interface ISchemaDatabaseItem {
  id: string;
  filePath?: string;
  dependency: {
    import: {
      name: string;
      from: string[];
    };
    export: {
      name: string;
      to: string[];
    };
  };
  dto: boolean;
  schema: AnySchemaObject;
  rawSchema: string;
}
