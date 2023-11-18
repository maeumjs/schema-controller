import type { RouteDefinition } from '@fastify/ajv-compiler';

export function getCacheKey(metadata: RouteDefinition): string {
  if (
    typeof metadata.schema === 'object' &&
    metadata.schema != null &&
    typeof (metadata.schema as { id?: string }).id === 'string'
  ) {
    return (metadata.schema as { id: string }).id;
  }

  if (
    typeof metadata.schema === 'object' &&
    metadata.schema != null &&
    typeof (metadata.schema as { $id?: string }).$id === 'string'
  ) {
    return (metadata.schema as { $id: string }).$id;
  }

  return `${metadata.method}::${metadata.httpPart}::${metadata.url}`;
}
