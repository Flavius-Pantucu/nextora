import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvProfile, userSettings } from "@/db/schema";
import { fail, readBody, requireUser, route } from "@/lib/api";
import { createProfileSchema } from "@/lib/api-schema";
import { SCHEMA_VERSION } from "@/lib/schema-version";
import { newProfileId, toClientProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";

/**
 * GET /api/profiles
 * Everything the workbench needs to open: every CV, plus which one was open,
 * in which template, at which page size, in which theme. One round trip.
 */
export const GET = route(async () => {
    const user = await requireUser();

    const [rows, settings] = await Promise.all([
        db.select().from(cvProfile).where(eq(cvProfile.userId, user.id)),
        db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1),
    ]);

    const stored = settings[0];
    const profiles = Object.fromEntries(rows.map((row) => [row.id, toClientProfile(row)]));

    // A remembered active id that has since been deleted would leave the app
    // with no CV on the board, so it falls back to whatever is there.
    const remembered = stored?.activeProfileId;
    const activeProfileId = remembered && profiles[remembered] ? remembered : (rows[0]?.id ?? null);

    return NextResponse.json({
        version: SCHEMA_VERSION,
        profiles,
        activeProfileId,
        activeTemplate: stored?.activeTemplate ?? "jake",
        pageFormat: stored?.pageFormat ?? "a4",
        darkMode: stored?.darkMode ?? false,
        localImported: Boolean(stored?.localImportedAt),
    });
});

/**
 * POST /api/profiles
 * Creates one CV. The client may supply the id it already minted, so an
 * offline-created profile keeps its identity when it reaches the server.
 */
export const POST = route(async (request) => {
    const user = await requireUser();
    const body = await readBody(request, createProfileSchema);

    const id = body.id ?? newProfileId();

    const existing = await db
        .select({ id: cvProfile.id })
        .from(cvProfile)
        .where(and(eq(cvProfile.userId, user.id), eq(cvProfile.id, id)))
        .limit(1);
    if (existing.length) return fail(409, "A CV with that id already exists.");

    const now = new Date();
    const [row] = await db
        .insert(cvProfile)
        .values({
            userId: user.id,
            id,
            name: body.name,
            schemaVersion: SCHEMA_VERSION,
            data: body.data,
            createdAt: body.createdAt ? new Date(body.createdAt) : now,
            updatedAt: now,
        })
        .returning();

    return NextResponse.json(toClientProfile(row), { status: 201 });
});
