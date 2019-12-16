<?php
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-h5p.php";

class TapestryH5P implements ITapestryH5P
{
  private $postId;

  public function __construct($postId = null)
  {
    $this->postId = $postId;
  }

  public function get()
  {
    global $wpdb;
    $content = $wpdb->get_results("select id, title from wp_h5p_contents");
    return $content;
  }
}
