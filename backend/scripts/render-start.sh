#!/usr/bin/env sh
set -e

echo "Clearing Laravel caches..."
php artisan optimize:clear

echo "Running database migrations..."
attempt=1
max_attempts=10
while [ "$attempt" -le "$max_attempts" ]; do
  if php artisan migrate --force; then
    echo "Migrations completed."
    break
  fi

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "Migration failed after ${max_attempts} attempts."
    exit 1
  fi

  echo "Migration attempt ${attempt}/${max_attempts} failed; retrying in 3 seconds..."
  attempt=$((attempt + 1))
  sleep 3
done

echo "Seeding database..."
php artisan db:seed --force

echo "Starting Laravel server on port ${PORT:-10000}..."
exec php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"