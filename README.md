# frostspear.playflex.net

The website for **FrostSpear: Tundra Hunt**: the game page, its privacy policy and a blog.
Built with [Astro](https://astro.build), served by Node on **port 3000** behind nginx.

Live: https://frostspear.playflex.net. Privacy policy for Play Console: https://frostspear.playflex.net/privacy/

```
src/data/game.ts               game facts: beasts, regions, screenshots, Google Play link
src/pages/index.astro          home page
src/pages/privacy.astro        privacy policy                     → /privacy/
src/pages/blog/                blog list and post pages            → /blog/
src/content/blog/*.md          blog posts, one Markdown file each
src/styles/site.css            all styles (colours and type at the top)
src/components/AdSlot.astro    ad space, off until you switch ads on
public/img/                    artwork rendered from the game (see "Artwork")
scripts/render-art.mjs         re-renders public/img from the game's own drawing code
Dockerfile, docker-compose.yml Node 26 LTS container on port 3000
deploy/update.sh               pull, rebuild and restart on the server
```

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321 with live reload
npm run build      # build for production
npm start          # serve the build on http://127.0.0.1:3000
```

## Common edits

* **The game goes live:** put the Google Play link in `playUrl` in `src/data/game.ts`. The home page
  then shows "Get it on Google Play" instead of the closed-test invitation.
* **A blog post:** add `src/content/blog/my-post.md` (it becomes `/blog/my-post/`):

  ```markdown
  ---
  title: "Post title"
  description: "One sentence for lists and search results."
  date: 2026-12-01
  draft: false          # true hides it
  ---

  Text in Markdown.
  ```

* **The privacy policy:** edit `src/pages/privacy.astro` and change its `effective` date. Keep
  `frozen-valley/docs/privacy-policy.md` the same.
* **Game facts** (beasts, regions, levels): `src/data/game.ts`. They come from the game's code, so
  update them when the game changes.

After any change: push, then run `./deploy/update.sh` on the server.

## Artwork

Everything in `public/img/` except the icons is drawn by the game's own code, so it always matches
the game. To re-render after the game's art changes:

```bash
# the game repo next to this one, built once
cd ../frozen-valley && npm ci && npm run build:dev
cd ../playflex.net && npm run art     # set CHROME_PATH if Playwright's Chromium isn't installed
```

The icons (`public/img/icon-*`) are copies of `frozen-valley/store/icon-512.png`.

## Ads (later)

Ads are off. Only blog posts can show them; the home page and the privacy policy never load the
ad script. When your AdSense account is approved, create `.env` in the repo folder on the server:

```
PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
PUBLIC_AD_SLOT_POST=1234567890
```

add `public/ads.txt` with the line AdSense gives you, then run `./deploy/update.sh`. Before you do:

* FrostSpear is for children, so in AdSense mark the site as child-directed (non-personalised ads only).
* Update section 8 ("This website") of the privacy policy: it says the site uses no cookies or
  ads, which stops being true.

## Server (Oracle, Docker)

Runs on Node 26 (Active LTS) as a non-root user with a read-only filesystem, on port 3000 of the
server (`"3000:3000"` in `docker-compose.yml`, so an nginx that runs in Docker can reach it too).
nginx is the only public entrance: port 3000 doesn't need an ingress rule in Oracle Cloud.

```bash
git clone https://github.com/ArjumanSreashtho/playflex.net.git ~/playflex.net
cd ~/playflex.net
docker compose up -d --build
curl -I http://127.0.0.1:3000/     # 200 OK
```

nginx forwards the domain to it:

```nginx
server {
    server_name frostspear.playflex.net;
    location / {
        proxy_pass http://127.0.0.1:3000;   # nginx in Docker: http://172.17.0.1:3000 (the host)
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # listen 443 ssl and certificate lines are added by: sudo certbot --nginx -d frostspear.playflex.net
}
```

**Update:** `cd ~/playflex.net && ./deploy/update.sh`. It also picks up Node security patches, so
run it every few weeks even when nothing changed. **Logs:** `docker compose logs -f web`.

Without Docker: `npm ci && npm run build`, then use `deploy/playflex-site.service` with systemd.
