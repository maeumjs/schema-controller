import type Ajv from 'ajv';
import type { Options as AjvOptions } from 'ajv';
import type { Options as FJSOptions } from 'fast-json-stringify';

export default interface ISchemaControllerBootstrapOption {
  /** json-schema database file path */
  filePath: string;

  ajv?: {
    /** ajv option */
    options?: AjvOptions;

    /** ajv extension */
    extension?: (ajv: Ajv) => void;
  };

  stringify?: {
    /** fast-json-stringify option */
    option?: FJSOptions;

    /** ajv(json-schema) validation apply on response data */
    useAjv?: boolean;

    /** use stringify function instead of fast-json-stringify  */
    useNative?: boolean;
  };
}
