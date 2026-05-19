export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing OAuth code', { status: 400 });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.GITHUB_CLIENT_ID,
      client_secret: import.meta.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json() as { access_token?: string; error?: string; error_description?: string };

  if (data.error || !data.access_token) {
    return new Response(`OAuth error: ${data.error_description ?? data.error}`, { status: 400 });
  }

  const payload = JSON.stringify({ token: data.access_token, provider: 'github' })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return new Response(
    `<!DOCTYPE html><html><body>
<script>
(function(){
  var d=${payload};
  function onMsg(e){window.opener.postMessage('authorization:github:success:'+JSON.stringify(d),e.origin);}
  window.addEventListener('message',onMsg,false);
  window.opener.postMessage('authorizing:github','*');
})();
<\/script>
</body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
};
