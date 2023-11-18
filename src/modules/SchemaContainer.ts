import type { ISchemaDatabaseItem } from '#/interfaces/ISchemaDatabaseItem';
import type { AnySchemaObject } from 'ajv';
import { parse } from 'jsonc-parser';
import type { ReadonlyDeep } from 'type-fest';

export class SchemaContainer {
  public static isSchemaDatabaseItem(
    value: ISchemaDatabaseItem | AnySchemaObject,
  ): value is ISchemaDatabaseItem {
    if (!('dependency' in value)) {
      return false;
    }

    if (!('id' in value)) {
      return false;
    }

    if (!('schema' in value)) {
      return false;
    }

    return true;
  }

  public static getDatabaseItem(item: ISchemaDatabaseItem | AnySchemaObject) {
    if (SchemaContainer.isSchemaDatabaseItem(item)) {
      const rawSchema = item.schema;

      if (typeof rawSchema === 'string') {
        const schema = <AnySchemaObject>parse(Buffer.from(rawSchema, 'base64').toString());
        const nextItem: ISchemaDatabaseItem = { ...item, schema };
        return nextItem;
      }

      return item;
    }

    if (item.$id == null) {
      throw new Error(`$id mandatory value in addschema ${JSON.stringify(item)}`);
    }

    const nextItem: ISchemaDatabaseItem = {
      id: item.$id,
      dependency: {
        import: { name: item.$id, from: [] },
        export: { name: item.$id, to: [] },
      },
      dto: false,
      filePath: `#/internal-added-${item.$id}`,
      rawSchema: JSON.stringify(item),
      schema: item,
    };

    return nextItem;
  }

  #schemaHash: Record<string, ISchemaDatabaseItem>;

  constructor() {
    this.#schemaHash = {};
  }

  getItems(): ReadonlyDeep<Record<string, ISchemaDatabaseItem>> {
    return this.#schemaHash;
  }

  getSchemas(): Record<string, AnySchemaObject> {
    return Object.entries(this.#schemaHash).reduce<Record<string, AnySchemaObject>>(
      (db, [id, item]) => {
        return { ...db, [id]: item.schema };
      },
      {},
    );
  }

  getItemOrThrow(key: string): ISchemaDatabaseItem {
    const schema = this.#schemaHash[key];
    if (schema == null) {
      throw new Error(`Cannot found schema using ${key}`);
    }
    return schema;
  }

  getSchemaOrThrow(key: string): AnySchemaObject {
    const item = this.#schemaHash[key];
    if (item == null) {
      throw new Error(`Cannot found schema using ${key}`);
    }
    return item.schema;
  }

  getItem(key: string): ISchemaDatabaseItem | undefined {
    const schema = this.#schemaHash[key];
    return schema;
  }

  get(key: string): AnySchemaObject | undefined {
    const schema = this.#schemaHash[key];
    return schema?.schema;
  }

  getOrThrow(key: string): AnySchemaObject | undefined {
    const schema = this.#schemaHash[key];
    if (schema == null || schema.schema == null) {
      throw new Error(`Cannot found schema using ${key}`);
    }
    return schema.schema;
  }

  setItem(
    item:
      | (Omit<ISchemaDatabaseItem, 'schema'> & { schema: string | AnySchemaObject })
      | AnySchemaObject,
  ): void {
    if (typeof item === 'boolean') {
      throw new Error('invalid schema type, schema is boolean');
    }

    const schema = SchemaContainer.getDatabaseItem(item);
    this.#schemaHash[schema.id] = schema;
  }

  setItems(schemas: (ISchemaDatabaseItem | AnySchemaObject)[]) {
    schemas.forEach((schema) => this.setItem(schema));
  }
}
