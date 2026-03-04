#!/usr/bin/env bash
# ─── Ecsendia Autos — Server Hardening Script ───────────────────────────────
# Run once on the production server as root or with sudo.
# Usage: sudo bash scripts/harden-server.sh
set -euo pipefail

echo "═══════════════════════════════════════════"
echo "  Ecsendia Autos — Server Hardening"
echo "═══════════════════════════════════════════"

# ── 1. Firewall (UFW) ─────────────────────────────────────────────────────────
echo ""
echo "[1/5] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    comment 'SSH'
ufw allow 80/tcp    comment 'HTTP'
ufw allow 443/tcp   comment 'HTTPS'
ufw --force enable
ufw status verbose
echo "✓ Firewall configured"

# ── 2. SSH Hardening ──────────────────────────────────────────────────────────
echo ""
echo "[2/5] Hardening SSH..."

SSHD_CONFIG="/etc/ssh/sshd_config"

# Backup original
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak.$(date +%Y%m%d)" 2>/dev/null || true

# Apply secure settings
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' "$SSHD_CONFIG"
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' "$SSHD_CONFIG"
sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' "$SSHD_CONFIG"
sed -i 's/^#*X11Forwarding.*/X11Forwarding no/' "$SSHD_CONFIG"
sed -i 's/^#*MaxAuthTries.*/MaxAuthTries 3/' "$SSHD_CONFIG"

# Verify key lines
grep -E "^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication)" "$SSHD_CONFIG"

# Validate config before restarting
sshd -t && systemctl reload sshd
echo "✓ SSH hardened (key-only, no root login)"

# ── 3. Nightly DB Backup ──────────────────────────────────────────────────────
echo ""
echo "[3/5] Setting up nightly PostgreSQL backups..."

# Create backup directory
mkdir -p /var/backups/ecsendia-db
chown postgres:postgres /var/backups/ecsendia-db 2>/dev/null || true

# Write backup script
cat > /usr/local/bin/ecsendia-db-backup.sh << 'BACKUP'
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/ecsendia-db"
DATE=$(date +%Y-%m-%d)
DB_NAME="ecsendia_autos"

# Dump
pg_dump "$DB_NAME" | gzip > "${BACKUP_DIR}/backup-${DATE}.sql.gz"

# Keep only last 14 days
find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +14 -delete

echo "$(date): Backup complete — ${BACKUP_DIR}/backup-${DATE}.sql.gz"
BACKUP

chmod +x /usr/local/bin/ecsendia-db-backup.sh

# Schedule via cron (2am daily)
CRON_LINE="0 2 * * * postgres /usr/local/bin/ecsendia-db-backup.sh >> /var/log/ecsendia-db-backup.log 2>&1"
CRON_FILE="/etc/cron.d/ecsendia-db-backup"
echo "$CRON_LINE" > "$CRON_FILE"
chmod 644 "$CRON_FILE"
echo "✓ DB backup scheduled at 2am daily (14-day retention)"

# Run a test backup now
echo "  Running test backup..."
if sudo -u postgres /usr/local/bin/ecsendia-db-backup.sh 2>/dev/null; then
  echo "  ✓ Test backup succeeded"
  ls -lh /var/backups/ecsendia-db/
else
  echo "  ⚠ Test backup failed — check DB name and postgres user access"
fi

# ── 4. SSL Cert Auto-Renewal Check ───────────────────────────────────────────
echo ""
echo "[4/5] Checking SSL cert auto-renewal..."
if command -v certbot &>/dev/null; then
  certbot renew --dry-run 2>&1 | tail -5
  # Ensure cron/timer is active
  if systemctl is-active --quiet certbot.timer 2>/dev/null; then
    echo "✓ certbot.timer is active"
  elif crontab -l 2>/dev/null | grep -q certbot; then
    echo "✓ certbot cron job found"
  else
    # Add renewal cron if missing
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'nginx -s reload'") | crontab -
    echo "✓ Added certbot renewal cron (3am daily)"
  fi
else
  echo "  ℹ certbot not found — using DigitalOcean managed cert or other method"
fi

# ── 5. npm audit ─────────────────────────────────────────────────────────────
echo ""
echo "[5/5] Running npm audit..."
cd /var/www/ecsendia-autos
npm audit --audit-level=high 2>&1 | tail -20
echo ""
echo "═══════════════════════════════════════════"
echo "  Hardening complete!"
echo "═══════════════════════════════════════════"
