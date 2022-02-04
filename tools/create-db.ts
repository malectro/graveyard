#!/usr/bin/env deno run --allow-read --allow-write --allow-env

import { db } from "../src/server/db.ts";

await db.close();
