import type { Options as FJSOptions } from 'fast-json-stringify';

export interface IStringifyContainerOption {
  /** fast-json-stringify option */
  option?: FJSOptions;

  /** ajv(json-schema) validation apply on response data */
  useAjv?: boolean;

  /** use stringify function instead of fast-json-stringify  */
  useNative?: boolean;

  /** displays a detailed error message when a schema validation error occurs */
  detailError?: boolean;
}
