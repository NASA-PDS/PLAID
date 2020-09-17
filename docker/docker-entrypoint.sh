#!/bin/bash
set -xe

if [[ -z "$DB_USER" || -z "$DB_PASSWORD" || -z "$DB_DATABASE" || -z "$DB_HOST" ]]; then
	echo "Missing environment variable, please check entrypoint file."
	exit 1
fi

sed "s/mysql_user/${DB_USER}/g; s/mysql_password/${DB_PASSWORD}/g; s/database_name/${DB_DATABASE}/g; s/localhost/${DB_HOST}/g;" /var/www/html/php/configuration.php.example > /var/www/html/php/configuration.php

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- apache2-foreground "$@"
fi

exec "$@"