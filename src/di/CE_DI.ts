/**
 * 심볼을 사용하는 것이 더 안정적이지만 const-enum에 심볼 사용하면 심볼 타입으로 인식해서 declaration 확장에서 const-enum의
 * 모든 요소가 동일 타입으로 인식되어 추출하는 타입이 정확하게 구분이 되지 않는 문제가 있다.
 *
 * Using symbol types is more robust, but when using symbols in const-enums, they are recognized as symbol types.
 * This causes an issue where all elements of the const-enum are recognized as the same type during declaration extension,
 * making it difficult to accurately differentiate the extracted types.
 *
 * For example, declare the tpye as follows,
 *
 * export const CE_DI = {
 *   CURL_CREATOR: Symbol('di-symbol-key-curl-creator'),
 *   MAEUM_LOGGERS: Symbol('di-symbol-key-maeum-loggers'),
 * } as const
 *
 * TypeScript recognizes the types of CE_DI.CURL_CREATOR and MAEUM_LOGGERS as the same symbol type
 * and does not differentiate between them. Therefore, even when the declarations are extended in the code,
 * the CURL_CREATOR type, which was written first, is always extracted.
 *
 * @see https://github.com/microsoft/TypeScript/issues/54100
 *
 * declare module '@maeum/tools' {
 *   interface IClassContainer {
 *     resolve(name: typeof CE_DI.CURL_CREATOR): CurlCreator;
 *     resolve(name: typeof CE_DI.REQUEST_LOGGER): RequestLogger;
 *     resolve(name: typeof CE_DI.WINSTON_LOGGERS): WinstonLoggers;
 *     resolve(name: typeof CE_DI.PINO_LOGGERS): PinoLoggers;
 *     resolve(name: typeof CE_DI.MAEUM_LOGGERS): MaeumLoggers;
 *   }
 * }
 *
 * Therefore, in the current situation, it seems reasonable to use sufficiently long and distinguishable strings, as shown below:
 */
export const CE_DI = {
  AJV: 'di-symbol-key-schema-controller-ajv',
  SCHEMA: 'di-symbol-key-schema-controller-schema',
  STRINGIFY: 'di-symbol-key-schema-controller-stringify',
} as const;

export type CE_DI = (typeof CE_DI)[keyof typeof CE_DI];
