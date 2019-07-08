<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

interface iTapestryNodeController extends iTapestryController
{
    public function updateTapestryNodeTitle($nodeMetaId, $title);
    public function updateTapestryNodeImageURL($nodeMetaId, $imageURL);
    public function updateTapestryNodeUnlockedStatus($nodeMetaId, $unlocked);
    public function updateTapestryNodeTypeData($nodeMetaId, $typeData);
    public function updateTapestryNodeCoordinates($nodeMetaId, $coordinates);
    public function updateTapestryNodePermissions($nodeMetaId, $permissions);
}
