import type { SchemaController } from '#/SchemaController';
import type { AjvContainer } from '#/modules/AjvContainer';
import type { StringifyContainer } from '#/modules/StringiftyContainer';
import type { CE_SYMBOL } from '#/symbols/CE_SYMBOL';
import '@maeum/tools';

declare module '@maeum/tools' {
  interface IClassContainer {
    resolve(name: typeof CE_SYMBOL.AJV): AjvContainer;
    resolve(name: typeof CE_SYMBOL.STRINGIFY): StringifyContainer;
    resolve(name: typeof CE_SYMBOL.STRINGIFY): SchemaController;
  }
}
