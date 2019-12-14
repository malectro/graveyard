#!/usr/bin/env deno run --allow-run

import {dirname, resolve} from 'https://deno.land/std/path/mod.ts';

import {buildDir} from './common.ts';

const {run} = Deno;

async function main() {
  const server = run({
    args: ['deno', 'run', '--allow-all', 'https://deno.land/std@v0.24.0/http/file_server.ts'],
    cwd: resolve(buildDir, 'client'),
  });

  await server.status();
}

main();
