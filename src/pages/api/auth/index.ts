export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request, redirect }) => {
  const url = new URL(request.url);
  const params = new URLSearchParams({
    client_id: import.meta.env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: `${url.origin}/api/auth/callback`,
  });
  return redirect(`https://github.com/login/oauth/authorize?${params}`);
};
