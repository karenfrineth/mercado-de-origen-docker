# syntax=docker/dockerfile:1
FROM php:8.2-fpm-alpine AS php
WORKDIR /srv/app
RUN docker-php-ext-install -j2 pdo_mysql opcache \
 && php -r 'foreach (["pdo_mysql","mbstring","openssl","tokenizer","xml","ctype","json","curl","dom"] as $ext) { if (!extension_loaded($ext)) { fwrite(STDERR, "Missing $ext\n"); exit(1); } }'

FROM php AS dependencies
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
RUN apk add --no-cache unzip
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache COMPOSER_CACHE_DIR=/tmp/composer-cache composer install --no-dev --prefer-dist --no-interaction --no-scripts --no-autoloader
COPY app ./app
COPY database ./database
RUN composer dump-autoload --optimize --no-dev --no-scripts && composer check-platform-reqs --no-dev

FROM php AS runtime
RUN apk add --no-cache nginx bash tini curl \
 && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
 && printf '[www]\nlisten = 127.0.0.1:9000\n' > /usr/local/etc/php-fpm.d/zzzz-listen.conf
COPY --from=dependencies /srv/app/vendor ./vendor
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY public ./public
COPY resources ./resources
COPY routes ./routes
COPY storage ./storage
COPY artisan composer.json ./
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --chmod=755 docker/start.sh /usr/local/bin/start-api
RUN chown -R www-data:www-data storage bootstrap/cache
USER www-data
EXPOSE 8000
ENTRYPOINT ["/sbin/tini","-g","--"]
CMD ["/usr/local/bin/start-api"]
