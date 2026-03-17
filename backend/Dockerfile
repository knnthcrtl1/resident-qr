FROM php:8.2-cli

WORKDIR /var/www/html

# Install OS packages and PHP extensions required by Laravel + PostgreSQL.
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

# Install Composer from official image.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install PHP dependencies first for better layer caching.
COPY composer.json composer.lock ./
RUN COMPOSER_ALLOW_SUPERUSER=1 COMPOSER_MEMORY_LIMIT=-1 composer install --no-interaction --no-progress --prefer-dist --optimize-autoloader --no-dev --no-scripts --ignore-platform-reqs

# Install frontend dependencies and build assets.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the application source.
COPY . .

# Ensure Laravel runtime directories exist and are writable in container.
RUN mkdir -p bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    && chmod -R 775 bootstrap/cache storage

# Build Vite assets for production.
RUN npm run build

EXPOSE 10000

CMD ["sh", "-c", "php artisan serve --host 0.0.0.0 --port ${PORT:-10000}"]
