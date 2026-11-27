#!/usr/bin/env bash
# Open ports 80 and 443 in the server's own firewall (Oracle images block them by default).
# You ALSO need to open them in the Oracle Cloud console (see README).
set -euo pipefail
if command -v firewall-cmd >/dev/null 2>&1; then
  # Oracle Linux
  sudo firewall-cmd --permanent --add-service=http --add-service=https
  sudo firewall-cmd --permanent --add-port=443/udp
  sudo firewall-cmd --reload
else
  # Ubuntu
  for p in 80 443; do
    sudo iptables -C INPUT -p tcp --dport "$p" -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport "$p" -j ACCEPT
  done
  sudo iptables -C INPUT -p udp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 6 -p udp --dport 443 -j ACCEPT
  sudo netfilter-persistent save 2>/dev/null || sudo sh -c 'iptables-save > /etc/iptables/rules.v4'
fi
echo "Ports 80 and 443 are open on this server."
