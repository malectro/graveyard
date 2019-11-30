import {dirname, resolve} from 'https://deno.land/std/path/mod.ts';

export const projectRoot = resolve(dirname(location.pathname), '..');
export const srcDir = resolve(projectRoot, 'src');
export const buildDir = resolve(projectRoot, 'build');
