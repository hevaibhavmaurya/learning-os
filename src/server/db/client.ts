import { drizzle } from "drizzle-orm/d1";
import { schema, type Schema } from "./schema";

export type Db = ReturnType<typeof createDb>;

/** Create a typed Drizzle client bound to a D1 database. */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type { Schema };
export { schema };
