# check for an install configuration file
if [[ -f "./bin/config.sh" ]]; then
    source "./bin/config.sh"
else
    DOCKER_WP_INSTALL_DELAY=30
fi

# wait for containers
echo "Waiting $DOCKER_WP_INSTALL_DELAY seconds for containers to be ready"
sleep $DOCKER_WP_INSTALL_DELAY

alias wp="docker-compose run --rm wpcli --path=/var/www/html"

# Install wordpress
wp core install --url=localhost:8000 --admin_user=admin --admin_email=foo@bar.com --admin_password=secret --title=tapestry --debug

# Install H5P
wp plugin install h5p

# Activate H5P and Tapestry plugins
wp plugin activate tapestry-wp h5p

# Create subscriber user
wp user create subscriber sub@foo.com --role=subscriber --user_pass=subscriber

# Rewrite permalink structure
wp rewrite structure '/%postname%/'

# Activate theme for Tapestry
wp theme install twentynineteen --activate
