import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) redirect("/");
    return <AuthForm />;
}
