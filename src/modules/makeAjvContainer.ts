import { AjvContainer } from '#/modules/AjvContainer';
import { $YMBOL_KEY_AJV_CONTAINER } from '#/symbols/SYMBOL_KEY_AJV_CONTAINER';
import type { IClassContainer } from '@maeum/tools';

export function makeAjvContainer(
  container: IClassContainer,
  options: ConstructorParameters<typeof AjvContainer>[0],
) {
  const ajv = new AjvContainer(options);
  container.register($YMBOL_KEY_AJV_CONTAINER, ajv);

  return ajv;
}
