import type { IAjvContainerOption } from '#/interfaces/IAjvContainerOption';
import { getCacheKey } from '#/modules/getCacheKey';
import type { RouteDefinition } from '@fastify/ajv-compiler';
import type { Options as AjvOptions, AnySchema, AnySchemaObject } from 'ajv';
import Ajv from 'ajv';
import type { ValidateFunction } from 'ajv/dist/core';
import type { ReadonlyDeep, SetRequired } from 'type-fest';

export class AjvContainer {
  #ajv: Ajv;

  #schemaMap: Map<string, AnySchemaObject>;

  #cache: Map<string, ValidateFunction>;

  #options?: AjvOptions;

  constructor(options?: IAjvContainerOption) {
    this.#ajv = options?.options != null ? new Ajv(options?.options) : new Ajv();
    this.#options = options?.options;
    this.#cache = new Map<string, ValidateFunction>();
    this.#schemaMap = new Map<string, AnySchemaObject>();

    options?.extension?.(this.#ajv);
  }

  get options(): ReadonlyDeep<AjvOptions> | undefined {
    return this.#options;
  }

  getSchema(id: string) {
    return this.#schemaMap.get(id);
  }

  getSchemas() {
    return Array.from(this.#schemaMap.entries()).reduce((aggregation, [id, schema]) => {
      return { ...aggregation, [id]: schema };
    }, {});
  }

  getSchemaOrThrow(id: string) {
    const schema = this.#schemaMap.get(id);

    if (schema == null) {
      throw new Error(`Cannot found schema using ${id}`);
    }

    return schema;
  }

  getValidator<T>(id: string) {
    return this.#ajv.getSchema<T>(id);
  }

  getNullableValidator<T>(id: string) {
    try {
      return this.#ajv.getSchema<T>(id);
    } catch {
      return undefined;
    }
  }

  getValidatorOrThrow<T>(id: string) {
    const validator = this.#ajv.getSchema<T>(id);

    if (validator == null) {
      throw new Error(`Cannot found schema validator using ${id}`);
    }

    return validator;
  }

  addSchemaWithoutId(schema: AnySchemaObject) {
    this.#ajv.addSchema(schema);
  }

  addSchema(schema: AnySchemaObject) {
    const id = schema.$id ?? schema.id;

    if (id == null) {
      throw new Error(`invalid schema id: ${schema.id} or ${schema.$id}`);
    }

    this.#ajv.addSchema(schema);
    const compiled = this.#ajv.compile(schema);
    this.#cache.set(id, compiled);
    this.#schemaMap.set(id, schema);
  }

  addSchemas(schemas: AnySchemaObject[]) {
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
      this.#cache.set(schema.$id, compiled);
    });
  }

  getCompile<T = unknown>(schema: AnySchemaObject, cacheKey?: string): ValidateFunction<T> {
    if (cacheKey != null) {
      const cache = this.#cache.get(cacheKey);

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

  // eslint-disable-next-line class-methods-use-this
  isRefsOnlySchema(schema: unknown): schema is { $ref: string } {
    if (typeof schema !== 'object') {
      return false;
    }

    if (schema == null) {
      return false;
    }

    if (Object.keys(schema).length !== 1) {
      return false;
    }

    if ('$ref' in schema && schema.$ref != null && typeof schema.$ref === 'string') {
      return true;
    }

    return false;
  }

  getRefsOnlySchema<T>(schema: unknown): ValidateFunction<T> | undefined {
    if (!this.isRefsOnlySchema(schema)) {
      return undefined;
    }

    const refs = schema.$ref;
    const validator = this.getNullableValidator<T>(refs);
    return validator;
  }

  getFastifyRouteValidator<T = unknown>(rawMetadata: unknown): ValidateFunction<T> {
    if (typeof rawMetadata === 'object' && rawMetadata == null) {
      throw new Error(`unknown schema type: ${typeof rawMetadata}`);
    }

    const metadata = rawMetadata as RouteDefinition;

    const cacheKey = getCacheKey(metadata);
    const cache = this.#cache.get(cacheKey);

    if (cache != null) {
      return cache as ValidateFunction<T>;
    }

    const { schema: metadataSchema } = metadata;
    const refsValidator = this.getRefsOnlySchema<T>(metadataSchema);

    if (refsValidator != null) {
      this.#cache.set(cacheKey, refsValidator);
      return refsValidator;
    }

    const schema = metadata.schema as AnySchemaObject;

    const validator = this.#ajv.compile<T>({ ...schema, $async: false });
    this.#cache.set(cacheKey, validator);

    return validator;
  }

  getOrThrow(_schemas: unknown): (schema: AnySchema, _meta?: boolean) => ValidateFunction {
    return (schema: unknown) => this.getFastifyRouteValidator(schema);
  }
}
