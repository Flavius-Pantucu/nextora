import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { auth } from "@/lib/auth";

/** The shape every failing endpoint returns. The client shows `error`. */
export function fail(status: number, error: string, details?: unknown) {
    return NextResponse.json({ error, ...(details ? { details } : {}) }, { status });
}

export class Unauthorized extends Error {}

/**
 * The session behind the request, or a 401.
 *
 * Every profile endpoint goes through this and then scopes its query by the id
 * it returns. There is no route that takes a user id from the client — a user
 * can only ever address their own rows.
 */
export async function requireUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Unauthorized();
    return session.user;
}

/** Parses a JSON body against a schema, or throws the 400 to return. */
export class BadRequest extends Error {
    constructor(
        message: string,
        readonly details?: unknown,
    ) {
        super(message);
    }
}

export async function readBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        throw new BadRequest("The request body is not valid JSON.");
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        throw new BadRequest("That request does not match what this endpoint accepts.", parsed.error.issues);
    }
    return parsed.data;
}

/**
 * Wraps a handler so the three failure modes above become responses, and an
 * unexpected error becomes a 500 with the detail in the server log rather than
 * in the response body.
 */
export function route<A extends unknown[]>(handler: (request: Request, ...args: A) => Promise<Response>) {
    return async (request: Request, ...args: A): Promise<Response> => {
        try {
            return await handler(request, ...args);
        } catch (error) {
            if (error instanceof Unauthorized) return fail(401, "Sign in to reach your CVs.");
            if (error instanceof BadRequest) return fail(400, error.message, error.details);
            console.error("[api]", error);
            return fail(500, "Something went wrong on the server.");
        }
    };
}
