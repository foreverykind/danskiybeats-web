export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing OAuth code');

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  if (data.error || !data.access_token) {
    return res.status(400).send(data.error_description ?? data.error);
  }

  // Verify the token actually belongs to a user with repo access
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${data.access_token}`, 'User-Agent': 'danskiybeats-cms' },
  });
  const userData = await userRes.json();

  const payload = JSON.stringify({ token: data.access_token, provider: 'github' })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html><html><body>
<p style="font-family:monospace;padding:20px">
  Authorized as: <strong>${userData.login ?? 'unknown'}</strong><br>
  Scopes: ${data.scope ?? 'none'}<br>
  <small>This message will close automatically...</small>
</p>
<script>
(function(){
  var d=${payload};
  function onMsg(e){window.opener.postMessage('authorization:github:success:'+JSON.stringify(d),e.origin);}
  window.addEventListener('message',onMsg,false);
  window.opener.postMessage('authorizing:github','*');
})();
<\/script>
</body></html>`);
}
