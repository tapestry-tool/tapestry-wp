alias wp="docker-compose run --rm wpcli"

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
