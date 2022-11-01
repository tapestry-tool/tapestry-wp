<!doctype html>
<html lang="en-US">
<head>
    <meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="profile" href="https://gmpg.org/xfn/11" />
	<?php wp_head(); ?>
    <style>
        #wpadminbar {
            display: none !important;
        }
        #tapestry-app > .toolbar {
            display: none !important;
        }
        <?php if (array_key_exists('no-sidebar', $_GET)): ?>
        .sidebar-container {
            display: none !important;
        }
        <?php endif; ?>
    </style>
</head>
<body <?php body_class(); ?>>
<div id="page" class="site">
<div id="content" class="site-content">