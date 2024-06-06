export const CE_SYMBOL = {
  STRINGIFY: Symbol('symbol-key-stringify-container'),
  SCHEMA: Symbol('symbol-key-schema-controller'),
  AJV: Symbol('symbol-key-ajv-container'),
} as const;

export type CE_SYMBOL = (typeof CE_SYMBOL)[keyof typeof CE_SYMBOL];
