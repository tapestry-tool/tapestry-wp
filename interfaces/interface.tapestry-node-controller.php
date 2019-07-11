<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

/**
 * Tapestry Node Controller Interface
 * 
 */
interface ITapestryNodeController extends ITapestryController
{
    /**
     * Update Tapestry Node Title
     * 
     * @param   String  $title          Node title
     *
     * @return  String  $title
     */
    public function updateTitle($title);

    /**
     * Update Tapestry Node Image URL
     * 
     * @param   String  $imageURL       Node image url
     *
     * @return  String  $imageURL
     */
    public function updateImageURL($imageURL);

    /**
     * Update Tapestry Node Unlocked Status
     * 
     * @param   Boolean $unlocked       Node unlocked status
     *
     * @return  Boolean $unlocked
     */
    public function updateUnlockedStatus($unlocked);

    /**
     * Update Tapestry Node Type Data
     * 
     * @param   Object  $typeData       Node type data
     *
     * @return  Object  $typeData
     */
    public function updateTypeData($typeData);

    /**
     * Update Tapestry Node Coordinates
     * 
     * @param   Number  $coordinates    Node coordinates
     *
     * @return  Number  $coordinates
     */
    public function updateCoordinates($coordinates);

    /**
     * Update Tapestry Node Permissions
     * 
     * @param   Object  $permissions    Node permissions
     *
     * @return  Object  $permissions
     */
    public function updatePermissions($permissions);
}
