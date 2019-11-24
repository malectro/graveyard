import nodeResolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
//import typescript from 'rollup-plugin-typescript2';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/client.ts',
  output: {
    file: 'build/client/client.js',
    format: 'umd',
    globals: {
      "pixi.js": "PIXI",
    },
  },
  plugins: [
    nodeResolve({mainFields: ['jsnext:main', 'browser', 'module', 'main']}),
    //commonjs(),
    typescript(),
  ],
  external: [
    'pixi.js',
  ],
};
