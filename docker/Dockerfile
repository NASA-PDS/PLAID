# Dockerfile
# ==========
#
# How to make an "APPS PLAID" image.
#
#
# Base Image
# ----------
#
# This is a PHP app, so we start with a PHP image, in this case PHP 5.6 based on Debian Linux 8,
# code named "jessie".
#
# ⚠️ Note that Debian "jessie" reached end-of-life on 2018-06-17 and end long-term support on 
# 2020-06-30. We really should look to use a more recent Debian Linux, such as `8.1.1-apache-bullseye`.
#
# ⚠️ PHP 5.6 reached end-of-life on 2019-01-01 and has no long-term support. It has received no
# security patches 3 years. Upgrading to `8.1.1-apache-bullseye` or later is strongly recommended.

FROM php:5.6-apache-jessie


# Dependencies
# ------------
#
# We need sSMTP to send mail and the MySQL PDO extensions for PHP. 

RUN : &&\
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
