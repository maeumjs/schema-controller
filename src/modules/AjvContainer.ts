import type { RouteDefinition } from '@fastify/ajv-compiler';
import type { Options as AjvOptions, AnySchema, AnySchemaObject } from 'ajv';
import Ajv from 'ajv';
import type { ValidateFunction } from 'ajv/dist/core';
import type ISchemaControllerBootstrapOption from 'src/interfaces/ISchemaControllerBootstrapOption';
import getCacheKey from 'src/modules/getCacheKey';
import type { ReadonlyDeep, SetRequired } from 'type-fest';

export default class AjvContainer {
  #ajv: Ajv;

  #cache: Record<string, ValidateFunction>;

  #options?: AjvOptions;

  constructor() {
    this.#ajv = new Ajv();
    this.#cache = {};
  }

  get options(): ReadonlyDeep<AjvOptions> | undefined {
    return this.#options;
  }

  reload(option: Pick<ISchemaControllerBootstrapOption, 'ajv'>) {
    this.#options = option.ajv?.options;
    this.#ajv = new Ajv(this.#options);
    option.ajv?.extension?.(this.#ajv);
  }

  set(schema: AnySchemaObject) {
    const id = schema.$id ?? schema.id;
    if (id == null) {
      throw new Error(`invalid schema id: ${schema.id} or ${schema.$id}`);
    }

    this.#ajv.addSchema(schema);
    const compiled = this.#ajv.compile(schema);
    this.#cache[id] = compiled;
  }

  setSchemas(schemas: AnySchemaObject[]) {
    const invalidSchemas = schemas.filter((schema) => {
      const id = schema.$id ?? schema.id;
      return id == null;
    });

    if (invalidSchemas.length > 0) {
      throw new Error(`invalid schema id: ${invalidSchemas.length}`);
    }

    this.#ajv.addSchema(schemas);

    (schemas as SetRequired<AnySchemaObject, '$id'>[]).forEach((schema) => {
      const compiled = this.#ajv.compile(schema);
      this.#cache[schema.$id] = compiled;
    });
  }

  getCompile<T = unknown>(schema: AnySchemaObject, cacheKey?: string): ValidateFunction<T> {
    if (cacheKey != null) {
      const cache = this.#cache[cacheKey];

      if (cache != null) {
        return cache as ValidateFunction<T>;
      }

      const validator = this.#ajv.compile<T>({ ...schema, $async: false });
      this.#cache[cacheKey] = validator;

      return validator;
    }

    const validator = this.#ajv.compile<T>({ ...schema, $async: false });
    return validator;
  }

  getCompileValidator(rawMetadata: unknown): ValidateFunction {
    if (typeof rawMetadata === 'object' && rawMetadata == null) {
      throw new Error(`unknown schema type: ${typeof rawMetadata}`);
    }

    const metadata = <RouteDefinition>rawMetadata;
    const schema = <AnySchemaObject>metadata.schema;

    const cacheKey = getCacheKey(metadata);
    const cache = this.#cache[cacheKey];

    if (cache != null) {
      return cache;
    }

    const validator = this.#ajv.compile({ ...schema, $async: false });
    this.#cache[cacheKey] = validator;

    return validator;
  }

  getOrThrow(_schemas: unknown): (schema: AnySchema, _meta?: boolean) => ValidateFunction {
    return (schema: unknown) => this.getCompileValidator(schema);
  }
}
