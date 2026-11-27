# playflex.net

The PlayFlex website: game pages, privacy policies and a blog. Built with
[Astro](https://astro.build) and served by Node on **port 3000** (nginx in front handles the domain and HTTPS).

```
src/games.ts                       the game list (name, tagline, features, Google Play link)
src/pages/index.astro              home page
src/pages/frostspear/index.astro   FrostSpear game page
src/pages/frostspear/privacy.astro FrostSpear privacy policy   → /frostspear/privacy/
src/content/blog/*.md              blog posts, one Markdown file each
src/components/AdSlot.astro        ad space, off until you switch ads on
deploy/playflex-site.service       systemd service (keeps the site running)
deploy/update.sh                   pull, build and restart on the server
```

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321 with live reload
npm run build      # build for production
npm start          # serve the build on http://127.0.0.1:3000
```

## Write a blog post

Add a file in `src/content/blog/`, e.g. `my-post.md` → `/blog/my-post/`:

```markdown
---
title: "Post title"
description: "One sentence shown in lists and search results."
date: 2026-12-01
game: frostspear      # optional
draft: false          # true hides it
---

Your text in Markdown.
```

Push, then run `./deploy/update.sh` on the server.

## Add a new game

1. Add it to `src/games.ts`.
2. Copy `src/pages/frostspear/` to `src/pages/<slug>/` and edit both pages.
3. The privacy policy URL for Play Console is `https://playflex.net/<slug>/privacy/`.

When a game is live, set its `playUrl` in `src/games.ts` to show a "Get it on Google Play" button.

## Ads (later)

Ads are off. To switch on Google AdSense once your account is approved, create a `.env` file in the
repo folder on the server, then run `./deploy/update.sh`:

```
PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
PUBLIC_AD_SLOT_HOME=1234567890
PUBLIC_AD_SLOT_POST=1234567890
```

and add `public/ads.txt` with the line AdSense gives you. Ads show on the home page and blog posts
only; privacy pages and the 404 page never load the ad script. FrostSpear is made for kids, so keep
ads off its game pages and use AdSense's family-safe settings.

## First-time setup on the Oracle server (Docker)

Runs in Docker on Node 26 (Active LTS), as a non-root user with a read-only filesystem, reachable
only from the server itself on `127.0.0.1:3000`.

```bash
# Docker (skip if `docker compose version` already works)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER      # then log out and back in

git clone https://github.com/ArjumanSreashtho/playflex.net.git ~/playflex.net
cd ~/playflex.net
chmod +x deploy/update.sh
docker compose up -d --build
curl -I http://127.0.0.1:3000/     # should say 200 OK
```

(Without Docker you can use `deploy/playflex-site.service` with systemd and Node 26 instead.)

nginx should forward the domain to it, for example:

```nginx
server {
    server_name playflex.net www.playflex.net;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

HTTPS: `sudo certbot --nginx -d playflex.net -d www.playflex.net`.

## Update

```bash
cd ~/playflex.net && ./deploy/update.sh
```

Logs: `docker compose logs -f web`

Security patches: `./deploy/update.sh` always rebuilds on the newest Node 26 image, so run it
every few weeks even when the site has not changed.
