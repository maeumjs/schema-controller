import type { CE_SCHEMA_ID_GENERATION_STYLE } from '#/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { CE_DI } from '#/di/CE_DI';
import { AjvContainer } from '#/modules/AjvContainer';
import type { IClassContainer } from '@maeum/tools';

export function makeAjvContainer(
  container: IClassContainer,
  style: CE_SCHEMA_ID_GENERATION_STYLE,
  options: ConstructorParameters<typeof AjvContainer>[1],
) {
  const ajv = new AjvContainer(style, options);
  container.register(CE_DI.AJV, ajv);
  return ajv;
}
