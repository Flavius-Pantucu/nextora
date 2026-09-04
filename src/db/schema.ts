import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import type { CVData, PageFormat, TemplateType } from "@/types/cv.types";

/* ===========================================================================
   Better Auth tables.

   Column *keys* are the field names Better Auth looks for; the strings are the
   snake_case names Postgres gets. Do not rename the keys — the Drizzle adapter
   maps its models onto them by key.
   =========================================================================== */

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
        .$defaultFn(() => false)
        .notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        // Added by Better Auth 1.7. Required, and "credential" for a password
        // account; check `getAuthTables()` before hand-editing any of these.
        issuer: text("issuer").notNull(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        // Hashed by Better Auth (scrypt). Never a plaintext password.
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* ===========================================================================
   Application tables.
   =========================================================================== */

/**
 * One row per CV profile.
 *
 * The CV itself is a `jsonb` document holding exactly the `CVData` the client
 * already authors — the shape the templates render and the JSON export writes.
 * Normalising the eight repeating sections into their own tables would cost
 * eight joins to draw one sheet and a migration for every field the templates
 * grow, and would buy nothing: nothing queries across CVs.
 *
 * `schemaVersion` is the same counter `src/lib/storage.ts` writes, so a row can
 * be run through the client's migration ladder if the shape moves on.
 *
 * The primary key is (userId, id) because `id` is minted on the client. That
 * keeps the client's own identifiers, and makes one user's ids incapable of
 * colliding with another's.
 */
export const cvProfile = pgTable(
    "cv_profile",
    {
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        id: text("id").notNull(),
        name: text("name").notNull(),
        schemaVersion: integer("schema_version").notNull().default(2),
        data: jsonb("data").$type<CVData>().notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.id] }), index("cv_profile_user_id_idx").on(table.userId)],
);

/**
 * The workbench state that is not a CV: which profile is open, which template
 * it is being drawn in, the page size, and the app theme. One row per user.
 */
export const userSettings = pgTable("user_settings", {
    userId: text("user_id")
        .primaryKey()
        .references(() => user.id, { onDelete: "cascade" }),
    activeProfileId: text("active_profile_id"),
    activeTemplate: text("active_template").$type<TemplateType>().notNull().default("jake"),
    pageFormat: text("page_format").$type<PageFormat>().notNull().default("a4"),
    darkMode: boolean("dark_mode").notNull().default(false),
    /** Set once the browser's localStorage profiles have been pulled up. */
    localImportedAt: timestamp("local_imported_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CVProfileRow = typeof cvProfile.$inferSelect;
export type UserSettingsRow = typeof userSettings.$inferSelect;
