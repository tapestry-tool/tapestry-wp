<?php
/**
 * The base configuration for WordPress
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
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'tapestry_wp' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', 'root' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '$wA_yXKg>K1S3d&$>XWnArYjCy1o1]@`E)Y(xVAWVjt.}4b!qAR51OM{$ +CDcV*' );
define( 'SECURE_AUTH_KEY',  ',^wrhwYoURPY2s!Zw}*;r!H+V?5PuaUo!~mHR`?n9L~0Ron~p)[gn7Uuxh4jgG${' );
define( 'LOGGED_IN_KEY',    'g`K}JGE##_;#(1&*.;*O7`` )p4Jv~Ut,4e@YkiwkiR>J.3_/O`Us&G<-4<A:)1>' );
define( 'NONCE_KEY',        '6JZVQ%k.1*&)G$/ikIW8S[N x+_VMmzK556WufrTz,//5Ss]JBqy>`#=!Y>+imfo' );
define( 'AUTH_SALT',        'Bu@mI$s:<Q7xQ;bjGffE`kFcTz:9&hUIP&uR1x<?Q;oZd;Ig(M4NSdyjej1(G(Re' );
define( 'SECURE_AUTH_SALT', 'y0his;3q ;JL)pq7D9%GErY;~C,OKiVgBp+zj5p|Xd@vk-R>,|wC{PUCCyRMf=tS' );
define( 'LOGGED_IN_SALT',   '-~f-0~[9PkF8)d[iM!7 ._.X-3$71g^MfF/`DOf?t$HhwZHj!pe;`6D|XDgl]}5I' );
define( 'NONCE_SALT',       'PG(ypNtu@0/fP1:_31z<uT;t/6z]m;`YIJ*Ys3bZ~:>/x-`X*JWFxZ/3Iz~2.8gS' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

define( 'WP_HOME', 'http://localhost:8888' );
define( 'WP_SITEURL', 'http://localhost:8888' );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
