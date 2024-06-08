import type { SchemaController } from '#/SchemaController';
import type { CE_DI } from '#/di/CE_DI';
import type { AjvContainer } from '#/modules/AjvContainer';
import type { StringifyContainer } from '#/modules/StringiftyContainer';
import '@maeum/tools';

declare module '@maeum/tools' {
  interface IClassContainer {
    resolve(name: typeof CE_DI.AJV): AjvContainer;
    resolve(name: typeof CE_DI.STRINGIFY): StringifyContainer;
    resolve(name: typeof CE_DI.SCHEMA): SchemaController;
  }
}
