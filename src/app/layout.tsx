import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
    title: "Nextora",
    description:
        "A CV workbench: author your history once, render it through faithful replicas of published resume formats, and export a PDF that matches the preview exactly.",
    manifest: "/manifest.json",
    icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light dark",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#F2ECDC" },
        { media: "(prefers-color-scheme: dark)", color: "#23211C" },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            {/* `dark` is toggled on <html> by the store once it knows the stored
                theme, so the server's markup and the client's first paint differ
                by that one class and nothing else. */}
            <body>{children}</body>
        </html>
    );
}
