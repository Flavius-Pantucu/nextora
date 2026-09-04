import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema";

/**
 * Auth.
 *
 * Email and password only. This is a single-person workbench (see PRODUCT.md),
 * so there is no sign-up funnel to optimise and no OAuth provider to configure
 * — an account exists so a CV can follow its owner between browsers, not so
 * the app can have users. Add a provider under `socialProviders` when that
 * changes; nothing else here has to move.
 */
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification },
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

    emailAndPassword: {
        enabled: true,
        // No mail server is wired up, so an unverifiable address must not be
        // able to lock the owner out of their own CVs.
        requireEmailVerification: false,
        minPasswordLength: 10,
    },

    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // refresh the cookie at most once a day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },

    advanced: {
        // Same-origin app and API: nothing needs to read the cookie from JS.
        useSecureCookies: process.env.NODE_ENV === "production",
    },

    // Must be last: lets server actions and route handlers set cookies.
    plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
