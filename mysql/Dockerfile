FROM mysql:8.0

# Copy init script – executed on first container startup
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Ensure proper permissions
RUN chmod 644 /docker-entrypoint-initdb.d/init.sql
