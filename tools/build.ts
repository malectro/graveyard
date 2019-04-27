#!/usr/bin/env deno --allow-run

import {dirname, resolve} from 'https://deno.land/std/fs/path.ts';

import {projectRoot} from './common.ts';

const {run, args} = Deno;

let tscArgs = [];
if (args[1] === 'dev')  {
  tscArgs = ['--watch'];
}

async function main() {
  const process = run({
    args: [
      'tsc',
      ...tscArgs,
    ],
    cwd: projectRoot,
  });

  await process.status();
}

main();
