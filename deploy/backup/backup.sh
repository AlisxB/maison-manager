#!/bin/bash
set -e

# Configuration
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
YEAR=$(date +"%Y")
MONTH=$(date +"%m")
BACKUP_FILE="${BACKUP_DIR}/${YEAR}/${MONTH}/maison_${TIMESTAMP}.sql.gz"
LOG_PREFIX="[BACKUP]"

# Ensure directory exists
mkdir -p "${BACKUP_DIR}/${YEAR}/${MONTH}"

echo "${LOG_PREFIX} Starting backup process at $(date)"

# 1. PostgreSQL Dump & Compress
echo "${LOG_PREFIX} Dumping database ${POSTGRES_DB}..."

# Using pg_dump with compression
# PGPASSWORD environment variable should be set in docker-compose
export PGPASSWORD=${POSTGRES_PASSWORD}

if pg_dump -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "${BACKUP_FILE}"; then
    echo "${LOG_PREFIX} Database dump successful: ${BACKUP_FILE}"
else
    echo "${LOG_PREFIX} ERROR: pg_dump failed!"
    # Ensure partial file is removed
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# 2. Rclone Upload (Google Drive)
# Assumes 'gdrive' remote is configured in rclone.conf
REMOTE_PATH="gdrive:backups/${YEAR}/${MONTH}"
echo "${LOG_PREFIX} Uploading to ${REMOTE_PATH}..."

if rclone copy "${BACKUP_FILE}" "${REMOTE_PATH}"; then
    echo "${LOG_PREFIX} Rclone upload successful."
else
    echo "${LOG_PREFIX} ERROR: Rclone upload failed!"
    exit 1
fi

# 3. Local Retention Policy (Delete files older than N days)
echo "${LOG_PREFIX} Cleaning up local backups older than ${RETAIN_DAYS_LOCAL} days..."
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETAIN_DAYS_LOCAL} -exec rm {} \;

echo "${LOG_PREFIX} Backup process completed successfully at $(date)"
