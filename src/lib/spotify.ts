const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE  = 'https://api.spotify.com/v1';

export interface SpotifyRelease {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: { url: string; width: number; height: number }[];
  external_urls: { spotify: string };
}

export async function getSpotifyToken(): Promise<string> {
  const id     = import.meta.env.SPOTIFY_CLIENT_ID;
  const secret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const creds  = Buffer.from(`${id}:${secret}`).toString('base64');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Spotify token: ${res.status} ${res.statusText}`);
  const { access_token } = await res.json();
  return access_token;
}

export async function getArtistDiscography(): Promise<SpotifyRelease[]> {
  const artistId = import.meta.env.SPOTIFY_ARTIST_ID;
  const token    = await getSpotifyToken();

  const url = `${API_BASE}/artists/${artistId}/albums?include_groups=album,single&limit=50&market=US`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Spotify albums: ${res.status} ${res.statusText}`);
  const { items } = await res.json();
  return items as SpotifyRelease[];
}
