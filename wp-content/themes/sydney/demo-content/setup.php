<?php
/**
 * Functions to provide support for the One Click Demo Import plugin (wordpress.org/plugins/one-click-demo-import)
 *
 * @package Sydney
 */


/**
 * Set import files
 */
function sydney_set_import_files() {
    return array(
        array(
            'import_file_name'              => __('Demo content', 'sydney'),
            'local_import_file'             => trailingslashit( get_template_directory() ) . 'demo-content/demo-content.xml',           
            'local_import_widget_file'      => trailingslashit( get_template_directory() ) . 'demo-content/demo-widgets.wie',
            'local_import_widget_file'      => trailingslashit( get_template_directory() ) . 'demo-content/demo-widgets.wie',
            'local_import_customizer_file'  => trailingslashit( get_template_directory() ) . 'demo-content/demo-customizer.dat',           
        ),
    );
}
add_filter( 'pt-ocdi/import_files', 'sydney_set_import_files' );

/**
 * Define actions that happen after import
 */
function sydney_set_after_import_mods() {

	//Assign the menu
    $main_menu = get_term_by( 'name', 'Menu 1', 'nav_menu' );
    set_theme_mod( 'nav_menu_locations', array(
            'primary' => $main_menu->term_id,
        )
    );

    //Asign the static front page and the blog page
    $front_page = get_page_by_title( 'My front page' );
    $blog_page  = get_page_by_title( 'My blog' );

    update_option( 'show_on_front', 'page' );
    update_option( 'page_on_front', $front_page -> ID );
    update_option( 'page_for_posts', $blog_page -> ID );

    //Assign the Front Page template
    update_post_meta( $front_page -> ID, '_wp_page_template', 'page-templates/page_front-page.php' );

}
add_action( 'pt-ocdi/after_import', 'sydney_set_after_import_mods' );

/**
* Remove branding
*/
add_filter( 'pt-ocdi/disable_pt_branding', '__return_true' );