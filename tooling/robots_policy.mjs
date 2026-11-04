// Staging must remain crawlable so search engines can read the page-level
// noindex directive. robots.txt is not an access-control boundary.
export const STAGING_ROBOTS_TXT = 'User-agent: *\nAllow: /\n';
