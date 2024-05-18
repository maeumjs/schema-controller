import type Ajv from 'ajv';
import type { Options as AjvOptions } from 'ajv';

export interface IAjvContainerOption {
  /** ajv option */
  options?: AjvOptions;

  /** ajv extension */
  extension?: (ajv: Ajv) => unknown;
}
