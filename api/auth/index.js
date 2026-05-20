export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: `https://${req.headers.host}/api/auth/callback`,
  });
  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
