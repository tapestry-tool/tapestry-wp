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

# Set TAPESTRY_USE_DEV_MODE to true
wp config set TAPESTRY_USE_DEV_MODE true --raw

if [ -z "{$KALTURA_ADMIN_SECRET}" ] || [ -z "{$KALTURA_PARTNER_ID}" ] || [ -z "{$KALTURA_SERVICE_URL}" ] || [ -z "{$KALTURA_UNIQUE_CONFIG}" ]
then
    echo  "Warning: some Kaltura variables are not set!\n"
else
    wp config set KALTURA_ADMIN_SECRET $KALTURA_ADMIN_SECRET
    wp config set KALTURA_PARTNER_ID $KALTURA_PARTNER_ID
    wp config set KALTURA_SERVICE_URL $KALTURA_SERVICE_URL
    wp config set KALTURA_UNIQUE_CONFIG $KALTURA_UNIQUE_CONFIG
fi