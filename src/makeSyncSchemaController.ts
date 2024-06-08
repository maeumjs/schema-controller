import { SchemaController } from '#/SchemaController';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { CE_DI } from '#/di/CE_DI';
import type { ISchemaControllerBootstrapOption } from '#/interfaces/ISchemaControllerBootstrapOption';
import { makeAjvContainer } from '#/modules/makeAjvContainer';
import { makeStringifyContainer } from '#/modules/makeStringifyContainer';
import type { IClassContainer } from '@maeum/tools';
import type { AnySchemaObject } from 'ajv';
import { parse } from 'jsonc-parser';
import fs from 'node:fs';

export function makeSyncSchemaController(
  container: IClassContainer,
  option: ISchemaControllerBootstrapOption,
) {
  const buf = fs.readFileSync(option.filePath);
  const schemFile = parse(buf.toString()) as {
    $store: { style: CE_SCHEMA_ID_GENERATION_STYLE; store: Record<string, unknown> };
  };

  const ajv = makeAjvContainer(container, schemFile.$store.style, option.ajv);
  const stringify = makeStringifyContainer(container, option.stringify);

  if (
    schemFile.$store.style === CE_SCHEMA_ID_GENERATION_STYLE.ID ||
    schemFile.$store.style === CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH
  ) {
    ajv.addSchemas(Object.values(schemFile.$store.store as Record<string, AnySchemaObject>));
  } else {
    ajv.initSchema(schemFile.$store.store as AnySchemaObject);
  }

  const schemaController = new SchemaController(ajv, stringify);
  container.register(CE_DI.SCHEMA, schemaController);

  return schemaController;
}
