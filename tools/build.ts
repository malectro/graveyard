#!/usr/bin/env deno run --allow-all --unstable

import {emptyDir, ensureDir, walk} from 'https://deno.land/std@0.123.0/fs/mod.ts';
import {dirname, resolve} from 'https://deno.land/std@0.123.0/path/mod.ts';

import {projectRoot} from './common.ts';

const {run, args, open, copyFile, readFile, writeFile} = Deno;

let tscArgs = [];
if (args[1] === 'dev')  {
  tscArgs = ['--watch'];
}

const srcDir = resolve(projectRoot, 'src');
const buildDir = resolve(projectRoot, 'build');

console.log('srcDir', srcDir);

async function main() {
  console.log('building to', buildDir);
  await ensureDir(buildDir);
  await emptyDir(buildDir);

  let promises = new Set();

  /*
  for await (const {filename} of walk(
    srcDir,
    {exts: ['ts'], skip: [/server.ts$/]},
  )) {
    let promise = moveFile(filename) ;
    promises.add(promise);
    promise.then(() => {
      promises.delete(promise);
    });
  }
  */

  console.log('copying statics');
  for await (const {path} of walk(
    srcDir,
    {includeDirs: false, skip: [/\.tsx?$/]},
  )) {
    let promise = copyToBuild(path) ;
    promises.add(promise);
    promise.then(() => {
      promises.delete(promise);
    });
  }

  await Promise.all(promises);

  /*
  const babelProcess = run({
    args: [
      'node_modules/.bin/babel',
      '--no-babelrc',
      'src',
      '--out-dir',
      'build',
      '--plugins=./tools/babel-ts-extension-plugin.js',
      '--ignore',
      'src/server.ts',
      '--extensions',
      '.ts',
    ],
    cwd: projectRoot,
  });
  await babelProcess.status();
  */

  console.log('Compiling...');

  /*
  const process = run({
    args: [
      'tsc',
      //...tscArgs,
    ],
    cwd: projectRoot,
  });
  */
 /*
  const process = run({
    cmd: [
      'npm',
      'run',
      'build',
    ],
    cwd: projectRoot,
  });
	*/

  const process = run({
		cmd: [
			'deno',
			'bundle',
			'--config',
			'src/deno.json',
			'--import-map',
			'src/import_map.json',
			'--no-check',
			'src/client.ts',
			'build/client.js',
		],
		cwd: projectRoot,
	});

  await process.status();

  /*
  await run({
    args: [
      'node_modules/.bin/tsc',
      '--project',
      'tsconfig.node.json'
    ],
    cwd: projectRoot,
  }).status();
  */
}

async function moveFile(filename: string) {
  const decoder = new TextDecoder();
  const fileSrc = decoder.decode(await readFile(filename));

  const buildFilename = getBuildFilename(filename);
  const buildFileDir = dirname(buildFilename); 
  await ensureDir(buildFileDir);

  const encoder = new TextEncoder();
  await writeFile(
    buildFilename,
    encoder.encode(fileSrc.replace(/\.ts'/g, '\.js\'')), 
  );
}

async function copyToBuild(filename: string) {
  const buildFilename = getBuildFilename(filename);
  console.log('copying file', filename, buildFilename);
  const buildFileDir = dirname(buildFilename); 
  await ensureDir(buildFileDir);
  await copyFile(filename, buildFilename);
}

function getBuildFilename(filename: string) {
  return resolve(buildDir, filename.replace(srcDir + '/', ''));
}

main();
