<?php
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-form.php";

class TapestryForm implements ITapestryForm
{
  private $postId;

  public function __construct($postId = null)
  {
    $this->postId = $postId;
  }

  public function getAll()
  {
    return GFAPI::get_forms();
  }
}
