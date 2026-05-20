export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    return res.status(500).json({ error: 'VERCEL_DEPLOY_HOOK_URL is not set' });
  }

  try {
    const r = await fetch(hookUrl, { method: 'POST' });
    const data = await r.json().catch(() => ({}));
    return res.status(200).json({ ok: true, jobId: data.job?.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
