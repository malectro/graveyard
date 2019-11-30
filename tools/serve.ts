#!/usr/bin/env deno run --allow-run

import {dirname, resolve} from 'https://deno.land/std/path/mod.ts';

import {buildDir} from './common.ts';

const {run} = Deno;

async function main() {
  const server = run({
    args: ['deno', 'run', '--allow-net', 'https://deno.land/std/http/file_server.ts'],
    cwd: resolve(buildDir, 'client'),
  });

  await server.status();
}

main();
