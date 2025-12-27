FROM alpine:3.18

# Install dependencies
RUN apk add --no-cache \
    postgresql-client \
    bash \
    rclone \
    gzip \
    curl \
    dcron

# Create backup directory
WORKDIR /app
RUN mkdir -p /backups /root/.config/rclone

# Copy scripts
COPY backup.sh /app/backup.sh
COPY run.sh /app/run.sh

# Permissions
RUN chmod +x /app/backup.sh /app/run.sh

# Entrypoint
ENV CRON_SCHEDULE="0 3 * * *"
ENV POSTGRES_HOST=db
ENV POSTGRES_PORT=5432
ENV POSTGRES_USER=postgres
ENV BACKUP_DIR=/backups
ENV RETAIN_DAYS_LOCAL=7

ENTRYPOINT ["/app/run.sh"]
