import { user } from "@vamp-bills/backend/db/auth-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { asc } from "drizzle-orm";

export async function list() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.name));
}
