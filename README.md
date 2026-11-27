# playflex.net

The PlayFlex website: a home page and one privacy policy per game.

```
site/                      the website (plain HTML, no build step)
  index.html               home page, lists the games
  frostspear/privacy/      FrostSpear: Tundra Hunt privacy policy
Caddyfile                  web server config (HTTPS is automatic)
docker-compose.yml         runs Caddy in Docker
deploy/open-ports.sh       opens ports 80/443 on the server
deploy/update.sh           pulls the latest site and reloads
```

Live URLs: `https://playflex.net/` and `https://playflex.net/frostspear/privacy/`

## Add a new game

Copy `site/frostspear/` to `site/<game>/`, edit `site/<game>/privacy/index.html`, add a card for it
in `site/index.html` and a line in `site/sitemap.xml`. Push, then run `./deploy/update.sh` on the server.

## First-time setup on the Oracle server

### 1. Point the domain at the server (Cloudflare → playflex.net → DNS)

* Delete the four GitHub `A @ 185.199.x.153` records, and any old `www` record.
* Add `A`, name `@`, content = the server's public IP, **DNS only (grey cloud)**.
* Add `CNAME`, name `www`, content `playflex.net`, **DNS only (grey cloud)**.
* Leave the email records (MX, TXT) alone.

### 2. Open ports 80 and 443 in Oracle Cloud

Oracle Cloud console → **Networking → Virtual cloud networks → (your VCN) → Security Lists →
Default Security List → Add Ingress Rules**:

| Source CIDR | Protocol | Destination port |
|---|---|---|
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |
| `0.0.0.0/0` | UDP | `443` |

### 3. On the server

```bash
# Docker (skip if `docker compose version` already works)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # then log out and back in

git clone https://github.com/ArjumanSreashtho/playflex.net.git
cd playflex.net
chmod +x deploy/*.sh
./deploy/open-ports.sh
docker compose up -d
docker compose logs -f web      # wait for "certificate obtained successfully", then Ctrl+C
```

Open `https://playflex.net/frostspear/privacy/`. The certificate renews by itself.

### 4. Turn off GitHub Pages

In the GitHub repo → **Settings → Pages**, set Source to **None**, so GitHub stops trying to serve
the domain.

## Updating the site

Edit files under `site/`, push to GitHub, then on the server:

```bash
cd ~/playflex.net && ./deploy/update.sh
```

## If ports 80/443 are already used on the server

Only one program can own ports 80/443. If another site (for example a game server behind nginx or
Caddy) already uses them, don't run this compose file; add playflex.net to that web server instead:

* **Existing Caddy:** add the two `playflex.net` blocks from `Caddyfile` to it, with `root` pointing at
  this repo's `site/` folder.
* **Existing nginx:**

  ```nginx
  server {
      server_name playflex.net www.playflex.net;
      root /home/ubuntu/playflex.net/site;
      index index.html;
      error_page 404 /404.html;
      location / { try_files $uri $uri/ =404; }
  }
  ```

  then `sudo certbot --nginx -d playflex.net -d www.playflex.net` for HTTPS.

## Troubleshooting

* `docker compose logs web` shows the reason a certificate failed. Usually the DNS record is still
  orange (proxied) or points elsewhere, or port 80 is closed in step 2 or 3.
* Check DNS: `nslookup playflex.net` should print the server's IP.
* Check ports from outside: `curl -I http://playflex.net` should answer with a redirect to https.
