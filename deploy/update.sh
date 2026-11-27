#!/usr/bin/env bash
# Pull the latest site from GitHub and reload Caddy. Run on the server from the repo folder:
#   ./deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
docker compose up -d
docker compose exec web caddy reload --config /etc/caddy/Caddyfile
echo "PlayFlex site updated."
