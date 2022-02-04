import {
  Database,
  SQLite3Connector,
} from "denodb";
import { resolve } from "https://deno.land/std@0.123.0/path/mod.ts";
import { projectRoot } from "../../tools/common.ts";
import {Entity} from './models.ts';

const connector = new SQLite3Connector({
  filepath: resolve(projectRoot, "data.db"),
});
export const db = new Database({
  connector,
  debug: false,
});

db.link([Entity]);
