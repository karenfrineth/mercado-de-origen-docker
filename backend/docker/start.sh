#!/usr/bin/env bash
set -euo pipefail
php artisan package:discover --no-interaction
php artisan migrate --force --no-interaction
php-fpm -F -g /tmp/php-fpm.pid &
fpm=$!
nginx -g 'daemon off;' &
web=$!
trap 'kill -TERM "$fpm" "$web" 2>/dev/null || true' EXIT
wait -n "$web" "$fpm"
