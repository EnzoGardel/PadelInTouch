const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
};

export default {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: SUPABASE_HOST ? [
      { protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/**" },
      { protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/render/image/**" }, // por si queda alguno
    ] : [],
    domains: SUPABASE_HOST ? [SUPABASE_HOST] : [],
  },
};
