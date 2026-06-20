export default function handler(req, res) {
  // Always send GitHub to the production callback — it's the single URL
  // registered on the OAuth App. The callback posts the token back to the
  // window that opened it (cross-origin via postMessage), so admin login works
  // from any host (production, Vercel preview/staging) with no per-domain setup.
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: 'https://danskiybeats.com/api/auth/callback',
  });
  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
