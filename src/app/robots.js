export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/thank-you"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
