import { SchemaController } from '#/SchemaController';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import type { ISchemaControllerBootstrapOption } from '#/interfaces/ISchemaControllerBootstrapOption';
import { makeAjvContainer } from '#/modules/makeAjvContainer';
import { makeStringifyContainer } from '#/modules/makeStringifyContainer';
import { $YMBOL_KEY_SCHEMA_CONTROLLER } from '#/symbols/SYMBOL_KEY_SCHEMA_CONTROLLER';
import type { IClassContainer } from '@maeum/tools';
import type { AnySchemaObject } from 'ajv';
import { parse } from 'jsonc-parser';
import fs from 'node:fs';

export async function makeAsyncSchemaController(
  container: IClassContainer,
  option: ISchemaControllerBootstrapOption,
) {
  const ajv = makeAjvContainer(container, option.ajv);
  const stringify = makeStringifyContainer(container, option.stringify);

  const buf = await fs.promises.readFile(option.filePath);
  const schemFile = parse(buf.toString()) as {
    $store: { style: CE_SCHEMA_ID_GENERATION_STYLE; store: Record<string, unknown> };
  };

  if (
    schemFile.$store.style === CE_SCHEMA_ID_GENERATION_STYLE.ID ||
    schemFile.$store.style === CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH
  ) {
    ajv.addSchemas(Object.values(schemFile.$store.store as Record<string, AnySchemaObject>));
  } else {
    ajv.addSchemaWithoutId(schemFile.$store.store as AnySchemaObject);
  }

  const schemaController = new SchemaController(ajv, stringify);
  container.register($YMBOL_KEY_SCHEMA_CONTROLLER, schemaController);

  return schemaController;
}
