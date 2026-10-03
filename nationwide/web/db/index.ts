import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import {existsSync} from 'node:fs';

let client: ReturnType<typeof createClient> | undefined;
export function getClient() {
  if(existsSync('.private/encryption-maintenance'))throw new Error('Data protection maintenance in progress');
  if (!client) {
    const url = process.env.CARE24_DATABASE_URL;
    if (!url || !url.startsWith("file:")) throw new Error("CARE24_DATABASE_URL must name the private local database.");
    client = createClient({ url });
  }
  return client;
}
export function getDb() { return drizzle(getClient(), { schema }); }
