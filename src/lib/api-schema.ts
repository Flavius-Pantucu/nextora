import { z } from "zod";
import type { CVData } from "@/types/cv.types";

/**
 * What the API will accept.
 *
 * The CV document is validated structurally rather than field by field: the
 * eight sections are the client's own `CVData`, they change whenever a template
 * needs a new field, and a schema that has to be edited in lockstep with the
 * types would reject a newer client for no benefit. What is enforced is what
 * the server actually depends on — the eight keys exist and are the right kind
 * of thing — plus hard size limits, because a base64 photo is the one field a
 * user can make arbitrarily large.
 */

const personal = z
    .object({
        name: z.string().max(200).default(""),
        title: z.string().max(200).default(""),
        email: z.string().max(320).default(""),
        phone: z.string().max(64).default(""),
        linkedin: z.string().max(500).default(""),
        github: z.string().max(500).default(""),
        website: z.string().max(500).default(""),
        location: z.string().max(200).default(""),
        summary: z.string().max(5000).default(""),
        // ~1.5MB of base64, i.e. about a 1MB image. Beyond that the row is a
        // liability and the PDF export chokes long before the database does.
        photoBase64: z.string().max(1_500_000).optional(),
    })
    .passthrough();

/** One section's rows. Each row carries an id; the rest is the template's business. */
const section = z.array(z.object({ id: z.string().min(1).max(64) }).passthrough()).max(200);

export const cvDataSchema = z
    .object({
        personal: personal,
        education: section,
        experience: section,
        skills: section,
        projects: section,
        certifications: section,
        languages: section,
        hobbies: section,
    })
    .passthrough()
    // The structural checks above are the whole contract; beyond them the
    // document is the client's `CVData` and is stored verbatim. Asserting it
    // here is the one place the loose parse result meets the typed column, so
    // no endpoint has to cast on its own.
    .transform((value) => value as unknown as CVData);

export const profileIdSchema = z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/, "A profile id may only contain letters, digits, dot, dash or underscore.");

export const createProfileSchema = z.object({
    id: profileIdSchema.optional(),
    name: z.string().min(1).max(120),
    data: cvDataSchema,
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export const updateProfileSchema = z
    .object({
        name: z.string().min(1).max(120).optional(),
        data: cvDataSchema.optional(),
    })
    .refine((body) => body.name !== undefined || body.data !== undefined, {
        message: "Send a name, data, or both.",
    });

export const settingsSchema = z
    .object({
        activeProfileId: z.string().max(64).nullable().optional(),
        activeTemplate: z
            .enum(["jake", "awesome", "classic", "deedy", "twentyseconds", "slate", "marquee", "greyboard", "ribbon", "cameo"])
            .optional(),
        pageFormat: z.enum(["a4", "letter"]).optional(),
        darkMode: z.boolean().optional(),
        localImported: z.literal(true).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: "Nothing to change." });

/** The one-time pull-up of whatever the browser had in localStorage. */
export const importSchema = z.object({
    profiles: z.array(createProfileSchema).min(1).max(100),
    /** Adopt the client's ids where they are free, rather than reminting them. */
    keepIds: z.boolean().default(true),
    /** Records the pull-up on the settings row so it is never offered twice. */
    markImported: z.boolean().default(false),
});

export type CreateProfileBody = z.infer<typeof createProfileSchema>;
export type ImportBody = z.infer<typeof importSchema>;
