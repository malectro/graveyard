import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
//import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import jsx from 'acorn-jsx';
import typescript from 'rollup-plugin-typescript';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export default {
  input: 'src/client.ts',
  output: {
    file: 'build/client.js',
    format: 'umd',
    globals: {
      'pixi.js': 'PIXI',
    },
  },
  acornInjectPlugins: [jsx()],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    nodeResolve({mainFields: ['jsnext:main', 'browser', 'module', 'main']}),
    commonjs({
      //include: /node_modules/,
      namedExports: {
        react: Object.keys(React),
        'react-dom': Object.keys(ReactDOM),
      },
    }),
    typescript({jsx: 'react'}),
  ],
  external: ['pixi.js'],
};
