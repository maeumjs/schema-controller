import AjvContainer from 'src/modules/AjvContainer';
import SchemaContainer from 'src/modules/SchemaContainer';
import StringifyContainer from 'src/modules/StringiftyContainer';

export default {
  schema: new SchemaContainer(),
  ajv: new AjvContainer(),
  stringify: new StringifyContainer(),
};
