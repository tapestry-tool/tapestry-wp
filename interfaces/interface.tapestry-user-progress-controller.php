<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

interface iTapestryUserProgressController extends iTapestryController
{ 
    public function updateH5PSettings($h5pSettingsData);
    public function getH5PSettings();
}
