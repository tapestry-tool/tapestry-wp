<?php
/**
 * The base configuration for WordPress.
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @see https://wordpress.org/support/article/editing-wp-config-php/
 */

// ** MySQL settings - You can get this info from your web host ** //
/* The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/* MySQL database username */
define('DB_USER', 'wordpress');

/* MySQL database password */
define('DB_PASSWORD', 'wordpress');

/* MySQL hostname */
define('DB_HOST', 'db:3306');

/* Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/* The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/*
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define('WP_DEBUG', true);
define('WP_DEBUG_DISPLAY', false);
define('WP_DEBUG_LOG', true);

/* That's all, stop editing! Happy publishing. */
define('FS_METHOD', 'direct');

/* Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__.'/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH.'wp-settings.php';
