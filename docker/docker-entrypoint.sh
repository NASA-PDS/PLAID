#!/bin/sh -e
#
# "APPS PLAID" entrypoint in a container


PATH=/usr/local/bin:/usr/bin:/usr/sbin:/bin:/sbin
export PATH


# Environment Variables
# ---------------------
#
# Check if the required environment variables must be set. All else are optional.

: ${DB_USER:?✋ The environment variable DB_USER is required}
: ${DB_PASSWORD:?✋ The environment variable DB_PASSWORD is required}
: ${DB_DATABASE:?✋ The environment variable DB_DATABASE is required}
: ${DB_HOST:?✋ The environment variable DB_HOST is required}


# sSMTP Configuration
# -------------------
#
# Generate the configuration file for sSMTP, the "Simple Simple Mail Transport Protocol" server.

# Directory and path setup
[ -d "/etc/ssmtp" ] || install --directory --owner=root --group=root --mode=755 /etc/ssmtp
conf="/etc/ssmtp/ssmtp.conf"
rm --force $conf

# Initial skeleton
cat >$conf <<EOF
Mailhub=${SMTP_HOST:-smtp.jpl.nasa.gov}:${SMTP_PORT:-25}
rewriteDomain=${SMTP_DOMAIN:-jpl.nasa.gov}
FromLineOverride=yes
EOF

# Encryption
case "${SMTP_SECURITY}" in
	"TLS")
		echo "UseTLS=yes" >>$conf
		;;
	"STARTTLS")
		echo "UseSTARTTLS=yes" >>$conf
		;;
	"")
		echo "Using no encryption to communicate with $SMTP_HOST; hope that's ok 😅" 1>&2
		;;
	*)
		echo "✋ Unrecognized SMTP_SECURITY «$SMTP_SECURITY»; use either TLS or STARTTLS" 1>&2
		exit 1
		;;
esac

# Username and password
if [ ! -z "${SMTP_USER}" ]; then
	if [ -z "${SMTP_PASSWORD}" ]; then
		echo "✋ Setting SMTP_USER also requires SMTP_PASSWORD" 1>&2
		exit 1
	fi
	cat >>$conf <<EOF
AuthUser=${SMTP_USER}
AuthPass=${SMTP_PASSWORD}
EOF
	if [ -z "${SMTP_SECURITY}" ]; then
		echo "Using SMTP_USER without SMTP_SECURITY could expose your SMTP_PASSWORD 😦" 1>&2
		echo "But continuing on… 😇" 1>&2
	fi
fi


# PHP Configuration
# -----------------
#
# Set up PHP to talk to MariaDB https://cutt.ly/bUW2xOZ

rm --force /var/www/html/php/configuration.php
sed --expression="s/mysql_user/${DB_USER}/g" \
	--expression="s/mysql_password/${DB_PASSWORD}/g" \
	--expression="s/database_name/${DB_DATABASE}/g" \
	--expression="s/localhost/${DB_HOST}/g" \
	/var/www/html/php/configuration.php.example >/var/www/html/php/configuration.php


# Command Processing
# ------------------

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- apache2-foreground "$@"
fi

exec "$@"
