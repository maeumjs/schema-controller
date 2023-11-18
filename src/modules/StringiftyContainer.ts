import type { ISchemaControllerBootstrapOption } from '#/interfaces/ISchemaControllerBootstrapOption';
import type { AjvContainer } from '#/modules/AjvContainer';
import { getCacheKey } from '#/modules/getCacheKey';
import type { RouteDefinition } from '@fastify/ajv-compiler';
import { type Options as AjvOptions } from 'ajv';
import type { Options as FJSOptions, Schema as FJSSchema } from 'fast-json-stringify';
import fastJsonStringify from 'fast-json-stringify';
import { errorCodes } from 'fastify';
import type { FastifySchemaValidationError } from 'fastify/types/schema';

export class StringifyContainer {
  #options: ISchemaControllerBootstrapOption['stringify'];

  #cache: Record<string, (data: unknown) => string>;

  #ajv?: AjvContainer;

  constructor() {
    this.#options = undefined;
    this.#cache = {};
  }

  reload(options: Pick<ISchemaControllerBootstrapOption, 'stringify'>) {
    this.#options = options.stringify;
  }

  setAjv(ajv: AjvContainer) {
    this.#ajv = ajv;
  }

  getSerializerWithValidator(
    metadata: RouteDefinition,
    schema: FJSSchema,
    rawSchemas?: unknown,
    fjsoption?: FJSOptions,
  ) {
    const container = this.#ajv;

    if (container == null) {
      throw new Error('ajv container mandatory value');
    }

    const option = fjsoption ?? {};
    const schemas = rawSchemas as Record<string, FJSSchema>;

    option.schema = schemas;
    option.ajv = { ...(container.options ?? {}) } as AjvOptions;

    const stringify = this.#options?.useNative ? JSON.stringify : fastJsonStringify(schema, option);

    const validator = this.#ajv?.getCompileValidator(metadata);

    if (validator != null) {
      return (data: unknown) => {
        const result = validator(data);

        if (!result) {
          const err = errorCodes.FST_ERR_VALIDATION(
            '[FST_ERR_VALIDATION]',
            'invalid "Reply" Model',
          );

          err.statusCode = 500;
          err.validation = validator.errors as unknown as FastifySchemaValidationError[];

          throw err;
        }

        return stringify(data);
      };
    }

    return (data: unknown) => {
      return stringify(data);
    };
  }

  getSerializerWithoutValidator(
    _metadata: RouteDefinition,
    schema: FJSSchema,
    rawSchemas?: unknown,
    fjsoption?: FJSOptions,
  ) {
    const container = this.#ajv;

    if (container == null) {
      throw new Error('ajv container mandatory value');
    }

    const option = fjsoption ?? {};
    const schemas = rawSchemas as Record<string, FJSSchema>;

    option.schema = schemas;
    option.ajv = { ...(container.options ?? {}) } as AjvOptions;

    const stringify = this.#options?.useNative ? JSON.stringify : fastJsonStringify(schema, option);

    return (data: unknown) => {
      return stringify(data);
    };
  }

  /**
   * factory 함수의 externalSchemas는 전체 스키마를 전달하고, option은 전체 option을 전달한다
   * factory 함수가 생성하는 내부 함수는 실제 라우트 설정에서 route metadata를 받고, 거기에 있는 schema를
   * 사용해서 fast-json-stringify 또는 stringify를 사용한다
   */
  getSerializerFunction(rawSchemas?: unknown) {
    return (rawMetadata?: unknown, fjsoption?: FJSOptions) => {
      if (typeof rawMetadata === 'object' && rawMetadata == null) {
        throw new Error(`unknown schema type: ${typeof rawMetadata}`);
      }

      const metadata = rawMetadata as RouteDefinition;
      const cacheKey = getCacheKey(metadata);
      const schema = metadata.schema as FJSSchema;

      const cached = this.#cache[cacheKey];

      if (cached != null) {
        return cached;
      }

      if (this.#options?.useAjv) {
        const serializer = this.getSerializerWithValidator(metadata, schema, rawSchemas, fjsoption);
        this.#cache[cacheKey] = serializer;
        return serializer;
      }

      const serializer = this.getSerializerWithoutValidator(
        metadata,
        schema,
        rawSchemas,
        fjsoption,
      );

      this.#cache[cacheKey] = serializer;
      return serializer;
    };
  }
}
