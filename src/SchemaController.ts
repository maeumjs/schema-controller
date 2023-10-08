import type ISchemaControllerBootstrapOption from '#/interfaces/ISchemaControllerBootstrapOption';
import type ISchemaDatabaseItem from '#/interfaces/ISchemaDatabaseItem';
import AjvContainer from '#/modules/AjvContainer';
import SchemaContainer from '#/modules/SchemaContainer';
import StringifyContainer from '#/modules/StringiftyContainer';
import type { AnySchemaObject } from 'ajv';
import type {
  FastifyInstance,
  FastifyServerOptions,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';
import { parse } from 'jsonc-parser';
import fs from 'node:fs';
import path from 'node:path';

export default class SchemaController {
  static #it: SchemaController;

  public static get it(): SchemaController {
    return SchemaController.#it;
  }

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
      controller.#schema.setItem(schema);
      return server;
    };

    return addSchema;
  }

  static createGetSchemaFunction(controller: SchemaController) {
    const getSchema = (schemaId: string) => {
      return controller.#schema.getSchemaOrThrow(schemaId);
    };

    return getSchema;
  }

  static createGetSchemasFunction(controller: SchemaController) {
    const getSchemas = () => {
      return controller.#schema.getSchemas();
    };

    return getSchemas;
  }

  public static getControllers(buf: Buffer, option: ISchemaControllerBootstrapOption) {
    const parsed = parse(buf.toString()) as Record<string, ISchemaDatabaseItem>;

    const schema = new SchemaContainer();
    schema.setItems(Object.values(parsed));

    const ajv = new AjvContainer();
    ajv.reload(option);
    ajv.setSchemas(Object.values(schema.getItems()).map((item) => item.schema));

    const stringify = new StringifyContainer();
    stringify.reload(option);
    stringify.setAjv(ajv);

    return { schema, ajv, stringify };
  }

  public static bootstrap<T extends boolean>(
    async: T,
    option: ISchemaControllerBootstrapOption,
  ): T extends true ? Promise<ISchemaControllerBootstrapOption> : ISchemaControllerBootstrapOption;
  public static bootstrap<T extends boolean>(
    async: T,
    option: ISchemaControllerBootstrapOption,
  ): Promise<ISchemaControllerBootstrapOption> | ISchemaControllerBootstrapOption {
    if (async) {
      return (async () => {
        const filePath = path.resolve(option.filePath);

        // Read JSON Schema file
        const jsonSchemaBuf = await fs.promises.readFile(filePath);
        const { schema, ajv, stringify } = SchemaController.getControllers(jsonSchemaBuf, option);

        SchemaController.#it = new SchemaController(schema, ajv, stringify);

        return option;
      })();
    }
    const filePath = path.resolve(option.filePath);

    // Read JSON Schema file
    const jsonSchemaBuf = fs.readFileSync(filePath);
    const { schema, ajv, stringify } = SchemaController.getControllers(jsonSchemaBuf, option);

    SchemaController.#it = new SchemaController(schema, ajv, stringify);

    return option;
  }

  #schema: SchemaContainer;

  #ajv: AjvContainer;

  #stringify: StringifyContainer;

  constructor(schema: SchemaContainer, ajv: AjvContainer, stringify: StringifyContainer) {
    this.#schema = schema;
    this.#ajv = ajv;
    this.#stringify = stringify;
  }

  getValidator<T>(id: string) {
    const schema = this.#schema.getItemOrThrow(id);
    const validator = this.#ajv.getCompileValidator<T>(schema);
    return validator;
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
