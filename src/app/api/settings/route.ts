import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvProfile, userSettings } from "@/db/schema";
import { fail, readBody, requireUser, route } from "@/lib/api";
import { settingsSchema } from "@/lib/api-schema";

export const dynamic = "force-dynamic";

/** GET /api/settings — the workbench state that is not a CV. */
export const GET = route(async () => {
    const user = await requireUser();
    const [row] = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);

    return NextResponse.json({
        activeProfileId: row?.activeProfileId ?? null,
        activeTemplate: row?.activeTemplate ?? "jake",
        pageFormat: row?.pageFormat ?? "a4",
        darkMode: row?.darkMode ?? false,
        localImported: Boolean(row?.localImportedAt),
    });
});

/**
 * PATCH /api/settings — upserts. There is one row per user and it is created
 * on first write, so nothing has to seed it at sign-up.
 */
export const PATCH = route(async (request) => {
    const user = await requireUser();
    const body = await readBody(request, settingsSchema);

    // Pointing at a CV that does not exist would send the next load to an
    // empty board, so the id is checked against the user's own rows.
    if (body.activeProfileId) {
        const [owned] = await db
            .select({ id: cvProfile.id })
            .from(cvProfile)
            .where(and(eq(cvProfile.userId, user.id), eq(cvProfile.id, body.activeProfileId)))
            .limit(1);
        if (!owned) return fail(404, "No such CV to make active.");
    }

    const patch = {
        ...(body.activeProfileId !== undefined ? { activeProfileId: body.activeProfileId } : {}),
        ...(body.activeTemplate !== undefined ? { activeTemplate: body.activeTemplate } : {}),
        ...(body.pageFormat !== undefined ? { pageFormat: body.pageFormat } : {}),
        ...(body.darkMode !== undefined ? { darkMode: body.darkMode } : {}),
        ...(body.localImported ? { localImportedAt: new Date() } : {}),
        updatedAt: new Date(),
    };

    const [row] = await db
        .insert(userSettings)
        .values({ userId: user.id, ...patch })
        .onConflictDoUpdate({ target: userSettings.userId, set: patch })
        .returning();

    return NextResponse.json({
        activeProfileId: row.activeProfileId,
        activeTemplate: row.activeTemplate,
        pageFormat: row.pageFormat,
        darkMode: row.darkMode,
        localImported: Boolean(row.localImportedAt),
    });
});
