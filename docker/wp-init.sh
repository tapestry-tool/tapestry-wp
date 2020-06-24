cp /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.temp.sh
sed '$ d' /usr/local/bin/docker-entrypoint.temp.sh > /usr/local/bin/docker-entrypoint.sh
rm -f /usr/local/bin/docker-entrypoint.temp.sh

echo 'mkdir -p /var/www/html/wp-content/uploads' >> /usr/local/bin/docker-entrypoint.sh
echo 'chown www-data:www-data /var/www/html/wp-content/uploads' >> /usr/local/bin/docker-entrypoint.sh
echo 'chmod 0755 /var/www/html/wp-content/uploads' >> /usr/local/bin/docker-entrypoint.sh
echo 'exec "$@"' >> /usr/local/bin/docker-entrypoint.sh

# execute apache
# exec "apache2-foreground" 