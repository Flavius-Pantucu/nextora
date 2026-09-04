import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvProfile, userSettings } from "@/db/schema";
import { fail, readBody, requireUser, route } from "@/lib/api";
import { profileIdSchema, updateProfileSchema } from "@/lib/api-schema";
import { toClientProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** Rejects a malformed id before it reaches a query. */
async function readId(context: Context): Promise<string | null> {
    const { id } = await context.params;
    return profileIdSchema.safeParse(id).success ? id : null;
}

/** GET /api/profiles/:id */
export const GET = route(async (_request, context: Context) => {
    const user = await requireUser();
    const id = await readId(context);
    if (!id) return fail(400, "That is not a valid CV id.");

    const [row] = await db
        .select()
        .from(cvProfile)
        .where(and(eq(cvProfile.userId, user.id), eq(cvProfile.id, id)))
        .limit(1);

    if (!row) return fail(404, "No such CV.");
    return NextResponse.json(toClientProfile(row));
});

/**
 * PATCH /api/profiles/:id
 * Name, document, or both. The document is replaced wholesale rather than
 * merged: the client holds the authoritative copy while it is being edited,
 * and a partial merge of two section arrays has no sensible meaning.
 */
export const PATCH = route(async (request, context: Context) => {
    const user = await requireUser();
    const id = await readId(context);
    if (!id) return fail(400, "That is not a valid CV id.");

    const body = await readBody(request, updateProfileSchema);

    const [row] = await db
        .update(cvProfile)
        .set({
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.data !== undefined ? { data: body.data } : {}),
            updatedAt: new Date(),
        })
        .where(and(eq(cvProfile.userId, user.id), eq(cvProfile.id, id)))
        .returning();

    if (!row) return fail(404, "No such CV.");
    return NextResponse.json(toClientProfile(row));
});

/** DELETE /api/profiles/:id */
export const DELETE = route(async (_request, context: Context) => {
    const user = await requireUser();
    const id = await readId(context);
    if (!id) return fail(400, "That is not a valid CV id.");

    const [row] = await db
        .delete(cvProfile)
        .where(and(eq(cvProfile.userId, user.id), eq(cvProfile.id, id)))
        .returning({ id: cvProfile.id });

    if (!row) return fail(404, "No such CV.");

    // Never leave the settings row pointing at a CV that is gone.
    await db
        .update(userSettings)
        .set({ activeProfileId: null, updatedAt: new Date() })
        .where(and(eq(userSettings.userId, user.id), eq(userSettings.activeProfileId, id)));

    return new NextResponse(null, { status: 204 });
});
