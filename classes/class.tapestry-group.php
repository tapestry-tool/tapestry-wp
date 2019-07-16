<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-user-roles.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-group.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryGroupController implements ITapestryGroupController
{
    private $postId;
    private $groupMetaId;

    private $nodes;
    private $members;
    private $name;
    private $type;

    /**
     * Constructor
     * 
     * @param   Number  $postId post ID
     * @param   Number  $groupMetaId meta ID
     * 
     * @return  NULL
     */
    public function __construct($postId = 0, $groupMetaId = 0)
    {
        $this->postId = (int) $postId;
        $this->groupMetaId = (int) $groupMetaId;

        if (TapestryHelpers::isValidTapestryGroup($this->groupMetaId)) {
            $group = $this->_loadFromDatabase();
            $this->name = $group->name;
            $this->type = $group->type;
            $this->nodes = $group->nodes;
            $this->members = $group->members;
        } else {
            $this->nodes = [];
            $this->members = [];
            $this->name = '';
            $this->type = 'tapestry_group';
        }
    }

    /**
     * Save the Tapestry group
     * 
     * @return  Object  $group
     */
    public function save()
    {
        return $this->_saveToDatabase();
    }

    /**
     * Set Gode
     * 
     * @param   Object  $group  group
     *
     * @return  NULL
     */
    public function set($group)
    {
        if (isset($group->nodes) && is_array($group->nodes)) {
            $this->nodes = $group->nodes;
        }
        if (isset($group->members) && is_array($group->members)) {
            $this->members = $group->members;
        }
        if (isset($group->name) && is_string($group->name)) {
            $this->name = $group->name;
        }
        if (isset($group->type) && is_string($group->type)) {
            $this->type = $group->type;
        }
    }

    /**
     * Get the Tapestry group
     * 
     * @return  Object  $group
     */
    public function get()
    {
        if (!$this->nodeMetaId) {
            throw new TapestryError('INVALID_GROUP_META_ID');
        }
        return $this->_formGroup();
    }

    private function _loadFromDatabase()
    {
        return get_metadata_by_mid('post', $this->groupMetaId);
    }

    private function _saveToDatabase()
    {
        $group = $this->_formGroup();

        if (!$this->groupMetaId) {
            $this->groupMetaId = add_post_meta($this->postId, 'group', $group);
            $group->id = $this->groupMetaId;
        }

        update_metadata_by_mid('post', $this->groupMetaId, $group);

        return $group;
    }

    private function _formGroup()
    {
        return (object) [
            'id'        => $this->groupMetaId,
            'nodes'     => $this->nodes,
            'members'   => $this->members,
            'name'      => $this->name,
            'type'      => $this->type
        ];
    }
}
