# Dockerfile
# ==========
#
# How to make an "APPS PLAID" image.
#
#
# Base Image
# ----------
#
# This is a PHP app, so we start with a PHP image, in this case PHP 7.4.27 based on Debian Linux 11,
# code named "bullseye". Upgrading to PHP 8.1.1 would be even better, but there are a number of XML
# parsing issues in that version that we do not, at present, have time to address.

FROM php:7.4.27-apache-bullseye


# Dependencies
# ------------
#
# We need sSMTP to send mail and the MySQL PDO extensions for PHP. During development, you might want to
# change the `php.ini-production` to `php.ini-development` to enable Zend assertions, memory statistics,
# start error logging, all reporting enabled, and deprecation warnings.

RUN : &&\
    mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" &&\
    apt-get update --quiet &&\
    apt-get install --quiet --yes ssmtp &&\
    docker-php-ext-install mysqli pdo pdo_mysql &&\
    echo 'sendmail_path = "/usr/sbin/ssmtp -t -i -v"' > /usr/local/etc/php/conf.d/mail.ini &&\
    apt-get autoclean --quiet --yes &&\
    rm --force --recursive /var/lib/apt/lists/* &&\
    :


# Application
# -----------
#
# Here we install the actual "APPS PLAID" code into the image. No need to set the `WORKDIR` here as
# the base image has us in the right place, namely `/var/www/html`.
#
# Subdirs that comprise the application:

COPY config/        config/
COPY css/           css/
COPY js/            js/
COPY php/           php/
COPY thirdparty/    thirdparty/
COPY workspace/     workspace/

# This is used to provide online help to users of the app:

COPY documentation/ documentation/
COPY resources/plaid_guide.pdf resources/plaid_guide.pdf

# This is only used once for database setup, but we need it in the image so the database container
# can get to it:

COPY resources/plaid_dump.sql resources/plaid_dump.sql

# Finally, the top level PHP and HTML files:

COPY *.php *.html .


# Entry Point
# -----------
#
# Set up for the container's start up.

COPY docker/docker-entrypoint.sh /usr/local/bin
ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD ["apache2-foreground"]


# Metadata
# --------
#
# So we can be considered a nice, well-mannered image 😇

LABEL "org.label-schema.name"="APPS PLAID"
LABEL "org.label-schema.description"="Planetary Data System Label Assistance for Interactive Design (APPS PLAID)"
LABEL "org.label-schema.docker.cmd"="docker container run --detach --env DB_HOST=db --env SMTP_HOST=localhost --network internal --publish 8080:80 plaid"
LABEL "org.label-schema.schema-version"="1.0"
