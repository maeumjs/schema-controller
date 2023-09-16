import { parse } from 'jsonc-parser';
import fs from 'node:fs';
import path from 'node:path';
import container from 'src/container';
import type ISchemaControllerBootstrapOption from 'src/interfaces/ISchemaControllerBootstrapOption';
import type ISchemaDatabaseItem from 'src/interfaces/ISchemaDatabaseItem';

export default function bootstrap(option: ISchemaControllerBootstrapOption) {
  const filePath = path.resolve(option.filePath);

  // Read JSON Schema file
  const jsonSchemaBuf = fs.readFileSync(filePath);
  const parsed = parse(jsonSchemaBuf.toString()) as Record<string, ISchemaDatabaseItem>;

  container.schema.setItems(Object.values(parsed));

  container.ajv.reload(option);
  container.ajv.setSchemas(
    Object.values(container.schema.getItems()).map((schema) => schema.schema),
  );

  container.stringify.reload(option);
  container.stringify.setAjv(container.ajv);

  return parsed;
}
