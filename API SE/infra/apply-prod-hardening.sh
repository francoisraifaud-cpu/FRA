#!/bin/bash
# Appliquer sur astro-server (root). Idempotent autant que possible.
#
# Documentation : ../README.md et ../JOURNAL-OPERATIONS.md (dossier FRA/API SE).
# Après modification, consigner la date et le contexte dans JOURNAL-OPERATIONS.md.
#
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "=== apt upgrade ==="
apt-get update -qq
apt-get upgrade -y -qq

echo "=== swap 2G (si absent) ==="
if ! swapon --show | grep -q '/swapfile'; then
  if ! [ -f /swapfile ]; then
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile || true
fi
if ! grep -qs '^/swapfile' /etc/fstab; then
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "=== sysctl ==="
cat > /etc/sysctl.d/99-astro-server.conf <<'EOF'
# File descriptors / backlog
fs.file-max = 1048576
net.core.somaxconn = 4096
# Swap utilisé seulement si pression mémoire
vm.swappiness = 10
EOF
sysctl -p /etc/sysctl.d/99-astro-server.conf

echo "=== journald limits ==="
mkdir -p /etc/systemd/journald.conf.d
cat > /etc/systemd/journald.conf.d/00-size-limits.conf <<'EOF'
[Journal]
SystemMaxUse=500M
RuntimeMaxUse=128M
EOF
systemctl restart systemd-journald

echo "=== nginx (reverse proxy + rate limit) ==="
apt-get install -y nginx
install -m 644 /tmp/nginx-astro-api.conf /etc/nginx/sites-available/astro-api-proxy
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/astro-api-proxy /etc/nginx/sites-enabled/astro-api-proxy
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "=== UFW : port 80 (nginx) ==="
ufw allow 80/tcp comment 'nginx-astro-api' || true

echo "=== systemd astro-api : MemoryMax + env optionnel ==="
mkdir -p /etc/systemd/system/astro-api.service.d
cat > /etc/systemd/system/astro-api.service.d/10-hardening.conf <<'EOF'
[Service]
MemoryMax=1200M
# Fichier optionnel : y mettre ASTRO_API_KEY=... pour exiger le header X-API-Key sur l’API
EnvironmentFile=-/etc/default/astro-api
EOF

if ! [ -f /etc/default/astro-api ]; then
  cat > /etc/default/astro-api <<'DEF'
# Optionnel — authentification API (FastAPI middleware).
# 1) Générer une clé : openssl rand -hex 32
# 2) Décommenter et coller :
# ASTRO_API_KEY=votre_cle_secrete
# 3) systemctl daemon-reload && systemctl restart astro-api.service
# 4) Dans n8n : header X-API-Key = la même valeur
# Tant que ASTRO_API_KEY est absent ou vide, l’API reste ouverte comme avant.
DEF
  chmod 600 /etc/default/astro-api
fi

echo "=== docker-compose (Gotenberg limits + logs) ==="
if [ -f /tmp/docker-compose.yml.deploy ]; then
  cp /tmp/docker-compose.yml.deploy /opt/astro/docker-compose.yml
  ( cd /opt/astro && docker compose pull -q && docker compose up -d )
fi

echo "=== déploiement main.py ==="
if [ -f /tmp/main.py.deploy ]; then
  TS=$(date +%Y%m%d_%H%M%S)
  cp -p /opt/astro/api/main.py "/opt/astro/api/main.py.bak.hardening.${TS}" || true
  cp /tmp/main.py.deploy /opt/astro/api/main.py
  rm -rf /opt/astro/api/__pycache__
fi

systemctl daemon-reload
systemctl restart astro-api.service
sleep 2
systemctl is-active astro-api.service
systemctl is-active nginx

echo "=== smoke local ==="
curl -s -o /dev/null -w "nginx->api /health: %{http_code}\n" http://127.0.0.1/health || true
curl -s -o /dev/null -w "direct :8000/health: %{http_code}\n" http://127.0.0.1:8000/health || true

echo "=== noyau : reboot requis ? ==="
if [ -f /var/run/reboot-required ]; then
  echo "OUI — fichier /var/run/reboot-required présent. Planifier : shutdown -r now"
  cat /var/run/reboot-required.pkgs 2>/dev/null | tail -20 || true
  echo "Résumé écrit dans /root/REBOOT_REQUIRED.txt"
  cp /var/run/reboot-required /root/REBOOT_REQUIRED.txt 2>/dev/null || true
else
  echo "Non (pas de fichier reboot-required)"
fi

echo "=== fin ==="
