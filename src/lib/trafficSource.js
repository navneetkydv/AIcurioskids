const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|pingdom|uptime|monitor|curl|wget|python-requests|axios|go-http/i;

export const isBot = (ua) => !ua || BOT_RE.test(ua);

export function parseUA(ua) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua)
    ? "tablet"
    : /mobi|iphone|ipod|android/i.test(ua)
      ? "mobile"
      : "desktop";

  const browser = /edg\//i.test(ua) ? "Edge"
    : /opr\/|opera/i.test(ua) ? "Opera"
    : /samsungbrowser/i.test(ua) ? "Samsung Internet"
    : /fban|fbav/i.test(ua) ? "Facebook app"
    : /instagram/i.test(ua) ? "Instagram app"
    : /chrome|crios/i.test(ua) ? "Chrome"
    : /firefox|fxios/i.test(ua) ? "Firefox"
    : /safari/i.test(ua) ? "Safari"
    : "Other";

  const os = /android/i.test(ua) ? "Android"
    : /iphone|ipad|ipod/i.test(ua) ? "iOS"
    : /windows/i.test(ua) ? "Windows"
    : /mac os x|macintosh/i.test(ua) ? "macOS"
    : /linux|cros/i.test(ua) ? "Linux"
    : "Other";

  return { device, browser, os };
}

// Returns { host, url } for external referrers only.
export function parseReferrer(ref, ownHost) {
  const none = { host: null, url: null };
  if (!ref) return none;
  try {
    const u = new URL(ref);
    if (u.protocol === "android-app:") {
      return { host: u.hostname.slice(0, 100) || null, url: null }; // app package name
    }
    if (!/^https?:$/.test(u.protocol)) return none;
    const host = u.hostname.replace(/^www\./, "");
    const own = String(ownHost || "").split(":")[0].replace(/^www\./, "");
    if (!host || host === own) return none; // internal navigation is not a referrer
    return { host: host.slice(0, 100), url: `${u.origin}${u.pathname}`.slice(0, 300) };
  } catch {
    return none;
  }
}

const RULES = [
  [/^mail\.google\.com$/, "gmail", "email"],
  [/^(outlook\.live\.com|outlook\.office\.com)$/, "outlook", "email"],
  [/(^|\.)google\.[a-z.]+$|^com\.google\.android\.googlequicksearchbox$/, "google", "organic"],
  [/(^|\.)bing\.com$/, "bing", "organic"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo", "organic"],
  [/(^|\.)yahoo\.com$/, "yahoo", "organic"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$|^com\.facebook\.katana$/, "facebook", "social"],
  [/(^|\.)instagram\.com$|^com\.instagram\.android$/, "instagram", "social"],
  [/(^|\.)youtube\.com$|^youtu\.be$|^com\.google\.android\.youtube$/, "youtube", "social"],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, "x", "social"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin", "social"],
  [/(^|\.)(whatsapp\.com|wa\.me)$|^com\.whatsapp$/, "whatsapp", "social"],
  [/(^|\.)(t\.me|telegram\.org)$|^org\.telegram\.messenger$/, "telegram", "social"],
  [/(^|\.)pinterest\.[a-z.]+$/, "pinterest", "social"],
  [/(^|\.)reddit\.com$/, "reddit", "social"],
];

const clean = (s) => String(s || "").trim().toLowerCase().slice(0, 100);

// Order: your own UTM tags win, then ad click IDs, then the referrer.
// fbclid is only a fallback: Facebook adds it to ALL outbound links, so it does not prove a paid click.
export function classifySource({ utmSource, utmMedium, clickIdType, referrerHost }) {
  if (utmSource) {
    const paidClick = clickIdType === "gclid" || clickIdType === "msclkid";
    return { source: clean(utmSource), medium: clean(utmMedium) || (paidClick ? "paid" : "campaign") };
  }
  if (clickIdType === "gclid") return { source: "google", medium: "paid" };
  if (clickIdType === "msclkid") return { source: "bing", medium: "paid" };

  if (referrerHost) {
    for (const [re, source, medium] of RULES) {
      if (re.test(referrerHost)) return { source, medium };
    }
  }
  if (clickIdType === "fbclid") return { source: "facebook", medium: "social" };
  if (referrerHost) return { source: referrerHost, medium: "referral" };
  return { source: "direct", medium: "none" };
}