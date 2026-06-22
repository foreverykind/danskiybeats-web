# Hero video — rules & formats

How the hero background video is prepared and delivered. Applies to the `#hero`
section ([src/components/Hero.astro](../src/components/Hero.astro), transforms in
[src/lib/cloudinary.ts](../src/lib/cloudinary.ts), source URL in
[src/data/hero.json](../src/data/hero.json)).

## 1. Source prep (before Cloudinary)

Camera/edit exports are often 4K @ ~67 Mbps (200–500 MB). Cloudinary's plan
**rejects uploads > 100 MB**, and 4K is wasted for a web hero. So compress first:

- **Downscale to 1080p** (keep HD, drop 2–4K), **H.264**, CRF ~18–19, **lanczos** scaler.
- Lanczos matters: the default scaler softens 4K→1080 ("мыло"); lanczos stays sharp.

```bash
ffmpeg -y -i "input-4k.mp4" \
  -vf "scale=-2:1080:flags=lanczos" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -movflags +faststart -c:a aac -b:a 192k \
  "output-1080.mp4"
```

Result: ~40–100 MB for 20–60s — uploads fine. Then upload to Cloudinary and put
the resulting URL into `hero.json` → `video_url`.

> A 20–30s loop is preferred for a hero (cleaner loop, lighter); 60s works but is
> overkill — viewers see only the first few seconds.

## 2. Delivery transforms (Cloudinary)

Set in `cloudinary.ts`. **Always force H.264 (`vc_h264`) — never `f_auto`.**

| Target | Transform | Delivered (current 60s reel) |
|--------|-----------|------------------------------|
| **Desktop** | `q_auto:best,vc_h264,w_1920` | ~35.6 MB |
| **Mobile**  | `q_auto:good,vc_h264,w_1920` | ~17 MB |
| **Poster**  | `q_auto,f_jpg,so_0` (`.jpg`) | ~23 KB |

Width `w_1920` = native cap (source is 1080p; no upscale). Quality scale:
`q_auto:eco` (artefacts, avoid) < `:good` < `:best`.

### Why `vc_h264`, not `f_auto`

`f_auto` serves a **different codec per browser** — HEVC (`hvc1`) to Apple UAs,
VP9/webm to Chrome. Problems:
- Many phones can't inline-autoplay the per-device codec → hero never starts.
- Each codec is a **separate rendition**; a freshly-uploaded video's variant is
  un-warmed → first visit triggers a slow cold transcode of the 4K-ish source.

Forcing `vc_h264` = **one universal H.264 rendition** for every device: plays
everywhere, and a single file to warm.

## 3. Responsive selection (Hero.astro)

- Poster `<img>` shows instantly (`fetchpriority="high"`); video is `preload="none"`.
- On `window.load`, JS picks the src via `matchMedia('(max-width: 760px)')`:
  mobile → `data-src-mobile`, else `data-src`.
- `<video muted loop playsinline>` + JS `.play()` (muted autoplay, works on iOS/Android).

## 4. Warm the cache after every change

The first request to a new transform makes Cloudinary transcode (slow, can time
out on big sources). **After deploying a new `video_url` or transform, hit each
delivery URL once** so the CDN caches it before real users arrive:

```bash
BASE=https://res.cloudinary.com/dlgybgkrc/video/upload
V=<version>/<public-id>.mp4
curl -s -o /dev/null -w '%{size_download} %{content_type}\n' "$BASE/q_auto:best,vc_h264,w_1920/$V"   # desktop
curl -s -o /dev/null -w '%{size_download} %{content_type}\n' "$BASE/q_auto:good,vc_h264,w_1920/$V"   # mobile
curl -s -o /dev/null -w '%{size_download}\n' "$BASE/q_auto,f_jpg,so_0/<version>/<public-id>.jpg"     # poster
```

Confirm `content_type` reports `codecs=avc1` (H.264), not `hvc1`/`vp9`.

## Tuning notes

- Mobile quality lever order: **width** (sharpness on retina) → **quality level**.
  Sizes for this reel: w_854≈6.3 / w_1080≈8.6 / w_1280≈9.8 / w_1920≈17 MB (good).
- If mobile load speed matters more than max sharpness, `q_auto:best,w_1280`
  (~16 MB) looks ~the same on a phone screen as `w_1920` for less weight.
