alias wp="docker-compose run --rm wpcli"

wp core install --url=localhost:8000 --admin_user=admin --admin_email=foo@bar.com --admin_password=secret --title=tapestry --debug

wp plugin install h5p

wp plugin activate tapestry-wp h5p

wp user create subscriber sub@foo.com --role=subscriber --user_pass=subscriber

wp rewrite structure '/%postname%/'

wp theme install twentynineteen --activate