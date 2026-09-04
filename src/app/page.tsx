import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { Workbench } from "@/components/Workbench";

export const dynamic = "force-dynamic";

/**
 * The board. Nothing renders until there is a session, so the client never
 * has to hold a signed-out state of the whole workbench.
 */
export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/sign-in");

    // Whether this browser's local CVs have already been pulled up. Read on the
    // server so the offer is never flashed at someone who has answered it.
    const [settings] = await db
        .select({ localImportedAt: userSettings.localImportedAt })
        .from(userSettings)
        .where(eq(userSettings.userId, session.user.id))
        .limit(1);

    return (
        <Workbench
            account={{ name: session.user.name, email: session.user.email }}
            localImported={Boolean(settings?.localImportedAt)}
        />
    );
}
