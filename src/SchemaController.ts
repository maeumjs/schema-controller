import type { AjvContainer } from '#/modules/AjvContainer';
import type { StringifyContainer } from '#/modules/StringiftyContainer';
import type { AnySchemaObject } from 'ajv';
import type {
  FastifyInstance,
  FastifyServerOptions,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';

export class SchemaController {
  static createAddSchemaFunction(
    controller: SchemaController,
    server: FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>
    >,
  ) {
    const addSchema = (
      schema: AnySchemaObject,
    ): FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>
    > => {
      controller.#ajv.addSchema(schema);
      return server;
    };

    return addSchema;
  }

  static createGetSchemaFunction(controller: SchemaController) {
    const getSchema = (id: string) => {
      return controller.#ajv.getSchemaOrThrow(id);
    };

    return getSchema;
  }

  static createGetSchemasFunction(controller: SchemaController) {
    const getSchemas = () => {
      return controller.#ajv.getSchemas();
    };

    return getSchemas;
  }

  #ajv: AjvContainer;

  #stringify: StringifyContainer;

  constructor(ajv: AjvContainer, stringify: StringifyContainer) {
    this.#ajv = ajv;
    this.#stringify = stringify;
  }

  get ajv(): Readonly<AjvContainer> {
    return this.#ajv;
  }

  get stringify(): Readonly<StringifyContainer> {
    return this.#stringify;
  }

  getValidator<T>(id: string) {
    return this.#ajv.getValidator<T>(id);
  }

  getFastifyController(
    server: FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>
    >,
  ): NonNullable<FastifyServerOptions['schemaController']> {
    return ((controller) => {
      return {
        bucket(_parentSchemas?: unknown) {
          return {
            add: SchemaController.createAddSchemaFunction(controller, server).bind(server),
            getSchema: SchemaController.createGetSchemaFunction(controller).bind(server),
            getSchemas: SchemaController.createGetSchemasFunction(controller).bind(server),
          };
        },
        compilersFactory: {
          buildValidator: this.#ajv.getOrThrow.bind(this.#ajv),
          buildSerializer: this.#stringify.getSerializerFunction.bind(this.#stringify),
        },
      } satisfies NonNullable<FastifyServerOptions['schemaController']>;
    })(this);
  }
}
