/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // pg is a native-ish driver; keep it out of the bundler's hands.
    serverExternalPackages: ["pg"],
};

export default nextConfig;
