FROM wordpress

COPY wp-config.php /var/www/html/wp-config.php
COPY upload.ini /usr/local/etc/php/conf.d/uploads.ini
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf