<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

// BEGIN ENQUEUE PARENT ACTION
// AUTO GENERATED - Do not modify or remove comment markers above or below:

if ( !function_exists( 'chld_thm_cfg_locale_css' ) ):
    function chld_thm_cfg_locale_css( $uri ){
        if ( empty( $uri ) && is_rtl() && file_exists( get_template_directory() . '/rtl.css' ) )
            $uri = get_template_directory_uri() . '/rtl.css';
        return $uri;
    }
endif;
add_filter( 'locale_stylesheet_uri', 'chld_thm_cfg_locale_css' );

if ( !function_exists( 'chld_thm_cfg_parent_css' ) ):
    function chld_thm_cfg_parent_css() {
        wp_enqueue_style( 'chld_thm_cfg_parent', trailingslashit( get_template_directory_uri() ) . 'style.css', array( 'sydney-bootstrap' ) );
    }
endif;
add_action( 'wp_enqueue_scripts', 'chld_thm_cfg_parent_css', 10 );


/**
 * Register header widget area.
 *
 * @link https://www.wpbeginner.com/wp-themes/how-to-add-a-wordpress-widget-to-your-website-header/
 */
function wpb_widgets_init() {
 
    register_sidebar( array(
        'name'          => 'Custom Header Widget Area',
        'id'            => 'custom-header-widget',
        'before_widget' => '<div class="chw-widget">',
        'after_widget'  => '</div>',
        'before_title'  => '<h2 class="chw-title">',
        'after_title'   => '</h2>',
    ) );
 
}
add_action( 'widgets_init', 'wpb_widgets_init' );

// END ENQUEUE PARENT ACTION

// Custom Endpoints
require __DIR__ . '/../../plugins/tapestry/class.tapestry-controller.php';
require __DIR__ . '/../../plugins/tapestry/class.user-controller.php';

// Dummy function to test
add_action( 'rest_api_init', function () {
    register_rest_route( 'myplugin/v1', '/author/(?P<id>\d+)', array(
      'methods' => 'GET',
      'callback' => 'my_awesome_func',
    ) );
});

function my_awesome_func( $data ) {
    $posts = get_posts( array(
        'author' => $data['id'],
    ) );

    if ( empty( $posts ) ) {
        return null;
    }

    return $posts[0]->post_title;
}

// User endpoints

// Get current userId
///users/progress/(?P<userid>\d)/(?P<postid>\d)
add_action( 'rest_api_init', function () {
    register_rest_route( 'myplugin/v1', '/users/progress/', array(
      'methods' => 'GET',
      'callback' => 'get_user_progress_by_post_id',
    ) );
});

// Get user progress on a tapestry page by user id and post id
function get_user_progress_by_post_id(WP_REST_Request $request) {
    // var_dump($data["userid"]);
    // var_dump($data["postid"]);
    echo($request['userid']);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'myplugin/v1', '/users/progress/', array(
      'methods' => 'POST',
      'callback' => 'update_user_progress_by_post_id',
    ) );
});

function update_user_progress_by_post_id() {
    echo("test post progress");
    $userController = new UserController;
    $userId = 1;
    $postId = 42;
    $testProgress = json_decode('{"32":0.9644611867154382,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0}');
    $userController->updateProgress($userId, $postId, $testProgress);
}

// Tapestry Endpoints

add_action( 'rest_api_init', function () {
    register_rest_route( 'myplugin/v1', '/posts/getnodes', array(
      'methods' => 'GET',
      'callback' => 'getnodes',
    ) );
});

function getnodes() {
    $tapestryController = new TapestryController;
    $postId = 42; //arbitrary for my db
    $result = $tapestryController->getTapestryPost($postId);
    return $result;
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'myplugin/v1', '/posts/updatenodes', array(
      'methods' => 'POST',
      'callback' => 'createnodes',
    ) );
});

// Create tapestry Nodes
// TODO: remove the testPost
function createnodes() {
    $tapestryController = new TapestryController;
    $testPost = '{
        "settings": {
            "tapestrySlug": "intercultural-understanding",
            "saveProgressToCookie": false,
            "zoom": 1,
            "type": "tapestry",
            "title": "Intercultural Understanding",
            "status": "published"
        },
        "nodes": [
            {
                "type": "tapestry_node",
                "status": "published",
                "title": "Intercultural Understanding",
                "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/intercultural-understanding-resized.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "mediaDuration": 232,
                "typeId": 1,
                "group": 1,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/MAIN.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 800,
                "fy": 470
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "Segregation and Homophily",
                "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/segregation-homophily-resized.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 2,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/SEG-HOMPH.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 450,
                "fy": 150
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "Contact and Minorities",
                "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/contact-and-minorities-resized.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/CT-AND-MINORITIES.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 450,
                "fy": 700
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "What is a Minority?",
                "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/minority-resized.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/CT-DEFINING-MINORITIES.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 100,
                "fy": 470
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "Contact Theory",
                "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/ct0-resized.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/CT.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 1200,
                "fy": 470
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "Colourblind / Race-acknowledgement",
                "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/CLRBLND-RACE.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/COLORBLIND-VS-RACE-ACK.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 1550,
                "fy": 150
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "Structured Conversations",
                "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/STRUCTURED-CONV.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/STRUCTURED-CONVERSATIONS.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 1880,
                "fy": 470
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "How It Works",
                "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/HOW-IT-WORKS.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/HOW-IT-WORKS.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 1550,
                "fy": 700
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "Perspective-Taking / Empathy",
                "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/PERSP-TAKING-EMPATHY.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/PERSPECTIVE-EMPATHY.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 2100,
                "fy": 700
            },
            {
                "type": "tapestry_node",
                "status": "published",
                "nodeType": "",
                "title": "Perspective-Taking and Contact Theory",
                "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/PT-AND-CT.png",
                "mediaType": "video",
                "mediaFormat": "mp4",
                "typeId": 1,
                "group": 2,
                "typeData": {
                    "progress": [
                        {"group": "viewed", "value": 0},
                        {"group": "unviewed", "value": 1}
                    ],
                    "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/PT-AND-CT.mp4",
                    "mediaWidth": 960,
                    "mediaHeight": 600
                },
                "fx": 2100,
                "fy": 150
            }
        ],
        "links": [
            {"source": 1, "target": 2, "value": 1, "type": ""},
            {"source": 1, "target": 3, "value": 1, "type": ""},
            {"source": 1, "target": 4, "value": 1, "type": ""},
            {"source": 1, "target": 5, "value": 1, "type": ""},
            {"source": 5, "target": 6, "value": 2, "type": ""},
            {"source": 5, "target": 9, "value": 2, "type": ""},
            {"source": 5, "target": 8, "value": 2, "type": ""},
            {"source": 9, "target": 7, "value": 2, "type": ""},
            {"source": 7, "target": 10, "value": 2, "type": ""},
            {"source": 6, "target": 8, "value": 2, "type": ""}
        ]
    }';

    echo(json_decode($testPost)->settings->tapestrySlug);
    $testPost = json_decode($testPost);
    $tapestryController->updateTapestryPost($testPost);
}