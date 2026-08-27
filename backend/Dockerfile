FROM php:8.4-cli-alpine

# Fast precompiled PHP extensions installer (builds in seconds)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN apk add --no-cache bash git curl \
    && install-php-extensions pdo_pgsql pgsql mbstring pcntl bcmath zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

EXPOSE 8080

CMD ["sh", "-c", "until php -r \"new PDO('pgsql:host=' . env('DB_HOST', 'postgres') . ';port=' . env('DB_PORT', '5432') . ';dbname=' . env('DB_DATABASE', 'evently_db'), env('DB_USERNAME', 'postgres'), env('DB_PASSWORD', 'password'));\" 2>/dev/null; do echo 'Menunggu PostgreSQL aktif...'; sleep 1; done; php artisan migrate --force; php artisan db:seed --force; php artisan serve --host=0.0.0.0 --port=8080"]
