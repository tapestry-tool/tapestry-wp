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

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', 'MDm;Q#Ql][W@Va3*`Wy(mm/Mgn1V~&sK`.;f|T&[.dmWT,H*l0yBgv+sEsA~:NP^');
define('SECURE_AUTH_KEY', 'hn)f-.$HCq`!L.^AUO;{O(%?mf*-q[{CNp%2k90.tb& Hwe94mYD<UrT=Pe9#ig_');
define('LOGGED_IN_KEY', '+c=&UJ2d;J7;]|KIvc)q1 :;?ouc}Rmk4h?5ra*[Coe-6fu?+!M|/En*lMB@7_Zc');
define('NONCE_KEY', 'DWTLrDzww[Kr;m3$fiau!&R/O*XvSzQW#N]kIBVI`mOAk[{@4yZ+COc}S,%IUR5z');
define('AUTH_SALT', 'TIq]V_PMX[pY<.w 2(+%z|>Gf<c=4wD.kD2DON*~AgR*L9T{oq@5S(jkoc}} XP8');
define('SECURE_AUTH_SALT', 'r1wL4^v4$ET(Zs#Jn!t=Y}ipn|v_`rX=#k yZZsPzIjvl@[m^r6{AHOY~~hd,PrH');
define('LOGGED_IN_SALT', 'WWZ;b^N7k{8PUrC!8wwoI_]H;p}tL<3Tp];g[g>]e,3/oaw!<VUh.;-I{iBHM909');
define('NONCE_SALT', '}W@gg#Y8X5m:hc?R|F{FRt+q0guR~}r|uyw9]!v)U/-q}O;YcKsZk#L/X;}7[q;`');

/**#@-*/

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
define('WP_DEBUG_DISPLAY', true);
define('WP_DEBUG_LOG', true);

/* That's all, stop editing! Happy publishing. */
define('FS_METHOD', 'direct');

/* Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__.'/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH.'wp-settings.php';
