FROM php:8.2-cli

WORKDIR /var/www/html

# Install OS packages and PHP extensions required by Laravel + PostgreSQL.
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    libicu-dev \
    libpq-dev \
    libzip-dev \
    nodejs \
    npm \
    && docker-php-ext-install \
    bcmath \
    intl \
    pdo \
    pdo_pgsql \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer from official image.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install PHP dependencies first for better layer caching.
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev --no-scripts

# Install frontend dependencies and build assets.
COPY backend/package.json backend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy application source from backend directory.
COPY backend/. .

# Build Vite assets for production.
RUN npm run build

EXPOSE 10000

CMD ["sh", "-c", "php artisan serve --host 0.0.0.0 --port ${PORT:-10000}"]
