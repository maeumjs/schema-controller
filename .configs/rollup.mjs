import { dts } from 'rollup-plugin-dts';

const config = [
  {
    input: 'dist/types/origin/index.d.ts',
    output: [{ file: 'dist/types/index.d.ts', format: 'es' }],
    plugins: [dts({ tsconfig: 'tsconfig.prod.json' })],
  },
];

export default config;
