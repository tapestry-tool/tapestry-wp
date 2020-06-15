FROM wordpress

COPY wp-config.php /var/www/html/wp-config.php
COPY upload.ini /usr/local/etc/php/conf.d/uploads.ini

COPY wp-init.sh /usr/local/bin/apache2-init.sh
RUN chmod +x /usr/local/bin/apache2-init.sh

RUN apache2-init.sh