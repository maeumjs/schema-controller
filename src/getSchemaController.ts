import type { AnySchemaObject } from 'ajv';
import type {
  FastifyInstance,
  FastifyServerOptions,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';
import container from 'src/container';

export default function getSchemaController(
  server: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>
  >,
): FastifyServerOptions['schemaController'] {
  return {
    bucket(_parentSchemas?: unknown) {
      return {
        add(
          schema: AnySchemaObject,
        ): FastifyInstance<
          RawServerDefault,
          RawRequestDefaultExpression<RawServerDefault>,
          RawReplyDefaultExpression<RawServerDefault>
        > {
          container.schema.setItem(schema);
          return server;
        },
        getSchema(schemaId: string) {
          return container.schema.getSchemaOrThrow(schemaId);
        },
        getSchemas(): Record<string, AnySchemaObject> {
          return container.schema.getSchemas();
        },
      };
    },
    compilersFactory: {
      buildValidator: container.ajv.getOrThrow.bind(container.ajv),
      buildSerializer: container.stringify.getSerializer.bind(container.stringify),
    },
  };
}
