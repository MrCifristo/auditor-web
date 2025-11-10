#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[*] Deteniendo servicios..."
docker compose -f "$ROOT_DIR/docker-compose.dev.yml" down
