import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

declare global {
  var __salesHubPgClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL manquant. Copiez .env.example vers .env.local et complétez-le.");
}

// Réutilise la connexion entre les rechargements HMR en dev pour éviter d'épuiser les connexions.
const client =
  global.__salesHubPgClient ?? postgres(connectionString, { max: process.env.NODE_ENV === "production" ? 10 : 5 });

if (process.env.NODE_ENV !== "production") {
  global.__salesHubPgClient = client;
}

export const db = drizzle(client, { schema });
