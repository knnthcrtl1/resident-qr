FROM php:8.2-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    git \
    unzip \
    zip \
    libcurl4-openssl-dev \
    libicu-dev \
    libonig-dev \
    libpq-dev \
    libxml2-dev \
    libzip-dev \
    nodejs \
    npm \
    && docker-php-ext-install \
    bcmath \
    curl \
    intl \
    mbstring \
    pdo \
    pdo_pgsql \
    xml \
    zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN COMPOSER_ALLOW_SUPERUSER=1 COMPOSER_MEMORY_LIMIT=-1 composer install \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-dev \
    --no-scripts

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN mkdir -p bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    && chmod -R 777 bootstrap/cache storage \
    && chmod +x scripts/render-start.sh

RUN npm run build

EXPOSE 10000

CMD ["sh", "-c", "./scripts/render-start.sh"]