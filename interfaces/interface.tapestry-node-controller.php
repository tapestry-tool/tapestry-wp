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
     * @param   Integer $nodeMetaId     Node meta id
     * @param   String  $title          Node title
     *
     * @return  String  $title
     */
    public function updateTapestryNodeTitle($nodeMetaId, $title);

    /**
     * Update Tapestry Node Image URL
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   String  $imageURL       Node image url
     *
     * @return  String  $imageURL
     */
    public function updateTapestryNodeImageURL($nodeMetaId, $imageURL);

    /**
     * Update Tapestry Node Unlocked Status
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Boolean $unlocked       Node unlocked status
     *
     * @return  Boolean $unlocked
     */
    public function updateTapestryNodeUnlockedStatus($nodeMetaId, $unlocked);

    /**
     * Update Tapestry Node Type Data
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Object  $typeData       Node type data
     *
     * @return  Object  $typeData
     */
    public function updateTapestryNodeTypeData($nodeMetaId, $typeData);

    /**
     * Update Tapestry Node Coordinates
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Number  $coordinates    Node coordinates
     *
     * @return  Number  $coordinates
     */
    public function updateTapestryNodeCoordinates($nodeMetaId, $coordinates);

    /**
     * Update Tapestry Node Permissions
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Object  $permissions    Node permissions
     *
     * @return  Object  $permissions
     */
    public function updateTapestryNodePermissions($nodeMetaId, $permissions);
}
