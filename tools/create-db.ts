#!/usr/bin/env deno run --allow-read --allow-write --allow-env

//import knex from 'https://cdn.skypack.dev/knex';
//import knex from 'https://esm.sh/knex';
import { Database, SQLite3Connector, Model, DataTypes } from 'https://deno.land/x/denodb/mod.ts';
import {resolve} from 'https://deno.land/std@0.123.0/path/mod.ts';
import {projectRoot} from './common.ts';

const connector = new SQLite3Connector({
	filepath: resolve(projectRoot, 'data.db'),
});
const db = new Database({
	connector,
	debug: false,
});

class Entity extends Model {
	static table = 'entities';
  static timestamps = true;
	static fields = {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		assetId: {
			type: DataTypes.INTEGER,
		},
		speciesId: {
			type: DataTypes.INTEGER,
		},
		triggerId: {
			type: DataTypes.INTEGER,
		},
		box: {
			type: DataTypes.JSON,
		},
		instanceData: {
			type: DataTypes.JSON,
		},
	};
}

console.log('hi');
db.link([Entity]);
console.log('what');
db.sync();
console.log('ho');
await db.close();
