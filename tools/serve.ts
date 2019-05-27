#!/usr/bin/env deno run --allow-run

import {dirname, resolve} from 'https://deno.land/std@v0.5.0/fs/path.ts';

import {buildDir} from './common.ts';

const {run} = Deno;

async function main() {
  const server = run({
    args: ['deno', 'run', 'https://deno.land/std@v0.5.0/http/file_server.ts'],
    cwd: resolve(buildDir, 'client'),
  });

  await server.status();
}

main();
