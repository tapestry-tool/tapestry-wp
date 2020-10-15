alias wp="docker-compose run --rm wpcli --path=/var/www/html"

# Install wordpress
wp core install --url=localhost:8000 --admin_user=admin --admin_email=foo@bar.com --admin_password=secret --title=tapestry --debug

if [ $? != 0 ]; then
    echo "Error installing WordPress! Either the CLI is not yet available \
or the database is not accessible. Try increasing the container delay setting \
in 'config.sh'. You should run 'make-uninstall' before trying again.\n"
    exit 1
fi

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
