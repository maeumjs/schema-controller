import { StringifyContainer } from '#/modules/StringiftyContainer';
import { $YMBOL_KEY_STRINGIFY_CONTAINER } from '#/symbols/SYMBOL_KEY_STRINGIFY_CONTAINER';
import type { IClassContainer } from '@maeum/tools';

export function makeStringifyContainer(
  container: IClassContainer,
  options: ConstructorParameters<typeof StringifyContainer>[1],
) {
  const stringifyContainer = new StringifyContainer(container, options);
  container.register($YMBOL_KEY_STRINGIFY_CONTAINER, stringifyContainer);
  return stringifyContainer;
}
