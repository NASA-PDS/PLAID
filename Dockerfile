FROM php:5.6-apache-jessie

RUN apt-get update
RUN apt-get install -q -y ssmtp
RUN docker-php-ext-install mysqli pdo pdo_mysql

# for email; this may not be necessary if we don't use the container/server to send emails
# Reference: https://wiki.archlinux.org/index.php/SSMTP
#VOLUME /var/www/html

RUN echo 'sendmail_path = "/usr/sbin/ssmtp -t -i"' > /usr/local/etc/php/conf.d/mail.ini
COPY docker/ssmtp.conf /etc/ssmtp/ssmtp.conf
COPY docker/docker-entrypoint.sh /usr/local/bin



COPY . /var/www/html

#ENV DB_USER=plaid_admin \
 #   DB_PASSWORD=password \
 #   DB_DATABASE=plaid \
 #   DB_HOST=mariadb
      
# -e DB_USER=plaid_admin -e DB_PASSWORD=password -e DB_DATABASE=plaid -e DB_HOST=mariadb

#EXPOSE 80
#EXPOSE 8080
#EXPOSE 3306


ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD ["apache2-foreground"]  # because ENTRYPOINT is overridden, we have to also put in a value for CMD

#-----

