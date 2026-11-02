export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const paths = [
    "",
    "/course",
    "/book",
    "/about",
    "/faq",
    "/contact",
    "/enroll",
    "/privacy",
    "/terms",
    "/refund",
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/course" ? "weekly" : "monthly",
    priority: path === "" || path === "/course" || path === "/enroll" ? 1 : 0.6,
  }));
}
