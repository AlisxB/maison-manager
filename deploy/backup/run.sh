#!/bin/bash
set -e

echo "[STARTUP] Configuring Cron Schedule: ${CRON_SCHEDULE}"

# Create crontab entry
# Redirect stdout/stderr to process 1 (Docker logs)
echo "${CRON_SCHEDULE} /app/backup.sh >> /proc/1/fd/1 2>&1" > /etc/crontabs/root

echo "[STARTUP] Verifying database connection..."
export PGPASSWORD=${POSTGRES_PASSWORD}
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}"; do
    echo "[STARTUP] Waiting for database ${POSTGRES_HOST}..."
    sleep 5
done
echo "[STARTUP] Database is ready."

echo "[STARTUP] Checking rclone configuration..."
if [ ! -f /root/.config/rclone/rclone.conf ]; then
    echo "[WARNING] rclone.conf not found at /root/.config/rclone/rclone.conf"
    echo "          Backups will fail unless bound via volume."
fi

echo "[STARTUP] Starting cron daemon..."
# -f: Foreground, -l 2: Log level (info)
crond -f -l 2
