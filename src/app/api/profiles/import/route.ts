import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cvProfile, userSettings } from "@/db/schema";
import { readBody, requireUser, route } from "@/lib/api";
import { importSchema } from "@/lib/api-schema";
import { SCHEMA_VERSION } from "@/lib/schema-version";
import { newProfileId, toClientProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";

/**
 * POST /api/profiles/import
 *
 * The one-time pull-up of the CVs a browser was holding in localStorage before
 * this account existed, and the landing point for a JSON import.
 *
 * It only ever adds. An incoming id that is already taken is reminted rather
 * than written over, because the whole point of the pull-up is that nothing
 * the user already had can be destroyed by it.
 */
export const POST = route(async (request) => {
    const user = await requireUser();
    const body = await readBody(request, importSchema);

    const existing = await db.select({ id: cvProfile.id }).from(cvProfile).where(eq(cvProfile.userId, user.id));
    const taken = new Set(existing.map((row) => row.id));

    const now = new Date();
    const values = body.profiles.map((profile) => {
        const wanted = body.keepIds ? profile.id : undefined;
        const id = wanted && !taken.has(wanted) ? wanted : newProfileId();
        taken.add(id);
        return {
            userId: user.id,
            id,
            name: profile.name,
            schemaVersion: SCHEMA_VERSION,
            data: profile.data,
            createdAt: profile.createdAt ? new Date(profile.createdAt) : now,
            updatedAt: profile.updatedAt ? new Date(profile.updatedAt) : now,
        };
    });

    const rows = await db.insert(cvProfile).values(values).returning();

    if (body.markImported) {
        const patch = { localImportedAt: now, updatedAt: now };
        await db
            .insert(userSettings)
            .values({ userId: user.id, ...patch })
            .onConflictDoUpdate({ target: userSettings.userId, set: patch });
    }

    return NextResponse.json({ imported: rows.length, profiles: rows.map(toClientProfile) }, { status: 201 });
});
