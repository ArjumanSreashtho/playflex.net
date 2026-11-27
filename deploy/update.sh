#!/usr/bin/env bash
# Pull the latest site, rebuild on the newest Node 26 image and restart. Run on the server:
#   ./deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
docker compose up -d --build
docker image prune -f >/dev/null
for i in $(seq 1 20); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then echo "FrostSpear site is up on port 3000."; exit 0; fi
  sleep 2
done
echo "Site did not answer on port 3000. Check: docker compose logs web" >&2
exit 1
