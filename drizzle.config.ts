import { readFileSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit reads `.env`, but Next reads `.env.local` — and the app and the
 * migrations have to agree about which database they are talking to. So the
 * same file Next uses is loaded here, and anything already in the environment
 * still wins (that is how CI passes a different target).
 */
function loadEnvLocal() {
    let contents: string;
    try {
        contents = readFileSync(new URL(".env.local", import.meta.url), "utf8");
    } catch {
        return;
    }
    for (const line of contents.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const split = trimmed.indexOf("=");
        if (split === -1) continue;
        const key = trimmed.slice(0, split).trim();
        if (process.env[key] !== undefined) continue;
        process.env[key] = trimmed.slice(split + 1).trim().replace(/^["']|["']$/g, "");
    }
}

loadEnvLocal();

const url = process.env.DATABASE_URL;
if (!url) {
    // No fallback on purpose: a default would quietly migrate a different
    // database than the one the app is pointed at.
    throw new Error("DATABASE_URL is not set. Put it in .env.local (see .env.example).");
}

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: { url },
    verbose: true,
    strict: true,
});
