import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL ?? "postgresql://nextora:nextora@localhost:5433/nextora",
    },
    verbose: true,
    strict: true,
});
