import {dirname, resolve} from 'https://deno.land/std/path/mod.ts';

const fileUrl = new URL(import.meta.url);

export const projectRoot = resolve(dirname(fileUrl.pathname), '..');
export const srcDir = resolve(projectRoot, 'src');
export const buildDir = resolve(projectRoot, 'build');
