<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

interface iTapestrySettingController extends iTapestryController
{
    public function save($settings, $updateTapestryPost = true);
}
