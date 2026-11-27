#!/usr/bin/env bash
# Pull the latest site, rebuild and restart. Run on the server: ./deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
npm ci
npm run build
sudo systemctl restart playflex-site
sleep 2
curl -fsS -o /dev/null http://127.0.0.1:3000/ && echo "PlayFlex site is up on port 3000."
