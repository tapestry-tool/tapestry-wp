<?php

/**
 * Tapestry Gravity Forms Interface
 */
interface ITapestryForm
{
  /**
   * Get all created gravity forms
   * 
   * @return String all forms in json format
   */
  public function getAll();
}
