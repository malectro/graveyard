#!/usr/bin/env deno run --allow-run

import {dirname, resolve} from 'https://deno.land/std/fs/path.ts';

import {buildDir} from './common.ts';

const {run} = Deno;

async function main() {
  const server = run({
    args: ['deno', 'run', 'https://deno.land/std/http/file_server.ts'],
    cwd: buildDir,
  });

  await server.status();
}

main();
