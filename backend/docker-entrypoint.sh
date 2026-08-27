#!/bin/sh
set -e

echo "Menunggu database PostgreSQL siap..."
until php -r "try { new PDO('pgsql:host=' . (getenv('DB_HOST') ?: 'postgres') . ';port=' . (getenv('DB_PORT') ?: '5432') . ';dbname=' . (getenv('DB_DATABASE') ?: 'evently_db'), getenv('DB_USERNAME') ?: 'postgres', getenv('DB_PASSWORD') ?: 'password'); echo 'Database PostgreSQL siap!'; exit(0); } catch (Exception \$e) { exit(1); }" 2>/dev/null; do
    echo "PostgreSQL belum siap, mencoba lagi dalam 1 detik..."
    sleep 1
done

echo "Menjalankan migrasi basis data..."
php artisan migrate --force

echo "Memasukkan data seeder awal..."
php artisan db:seed --force

echo "Menyalakan Laravel REST API pada port 8080..."
exec php artisan serve --host=0.0.0.0 --port=8080
