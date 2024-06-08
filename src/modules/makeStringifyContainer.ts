import { CE_DI } from '#/di/CE_DI';
import { StringifyContainer } from '#/modules/StringiftyContainer';
import { type IClassContainer } from '@maeum/tools';

export function makeStringifyContainer(
  container: IClassContainer,
  options: ConstructorParameters<typeof StringifyContainer>[1],
) {
  const stringifyContainer = new StringifyContainer(container, options);
  container.register(CE_DI.STRINGIFY, stringifyContainer);
  return stringifyContainer;
}
