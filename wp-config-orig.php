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
define( 'DB_NAME', 'tapestry_test' );

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
define( 'AUTH_KEY',         '(7eyY|<.YSt7ZsQ?WVa/rO?klOz@7.;WZ_#F,rk?,zG/c>X9[qeMjaHLs)0{K[L<' );
define( 'SECURE_AUTH_KEY',  'T:P|AO,yZn&qT+`4]0~CJOv|B6v%$ 9rq(/VYT g%iEDr&gc7xiz_e?3$etc;X3!' );
define( 'LOGGED_IN_KEY',    '+<h(a~T]-USSCx)tBz3:S.+8 U7pyyQT rWli!X?5^V982b/}4R=0P;sl_o:vM6P' );
define( 'NONCE_KEY',        'd+v{BM mSTw,unG<nMoiOTXF[~dL4ho{oWCTR=z0b-:%Z@`oS|9KH?4T+qN.&DTC' );
define( 'AUTH_SALT',        'sv=4m`AH=A(08~GI_*#gX4gcuQTqP2$RNLuJ}kfphs(`mJ)y3$?sxlH.rl<jqn#r' );
define( 'SECURE_AUTH_SALT', '}m82T$x=RQu$Q)-*e~7Oq| X1UT(N;r)n;U9X?R1h|iL5wV[|S~g<G0bgoT/.zkD' );
define( 'LOGGED_IN_SALT',   'JdheCP!hFfXz@,nw[@{*x~dKMDR7N@N?1d)iQK9gP4Posl8DqXNq.?/0Z1dbaqP9' );
define( 'NONCE_SALT',       'Dq.JwVo2=~Y7XIg(v;*-}!=6~J/MbGH,H{y-~65{  :Wrox[>]As;}5&_HnQ,vum' );

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

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
