<?php

require_once dirname(__FILE__).'/../utilities/class.tapestry-errors.php';
require_once dirname(__FILE__).'/../interfaces/interface.tapestry-analytics.php';

/**
 * Handles analytics functionality in Tapestry.
 */
class TapestryAnalytics implements ITapestryAnalytics
{
    private $cookieName = 'tapestry_guid';
    private $tableNameNoPrefix = 'tapestry_analytics_events';

    private $userID = '';
    private $userUUID = '';
    private $tableName = '';

    /**
     * Constructor.
     *
     * @return null
     */
    public function __construct()
    {
        global $wpdb;
        $this->tableName = $wpdb->prefix.$this->tableNameNoPrefix;
        $this->userUUID = $this->getUserUUID();
        $this->userID = apply_filters('determine_current_user', false);
    }

    /**
     * Log an analytics event.
     *
     * @param object $data an object containing the required fields to be saved
     *
     * @return bool success?
     */
    public function log($data)
    {
        if ($this->userID) {
            $data['actor'] .= '-'.$this->userID;
        }

        global $wpdb;
        $success = $wpdb->insert(
            $this->tableName,
            [
                'actor' => $data['actor'],
                'action' => $data['action2'],
                'object' => $data['object'],
                'userUUID' => $this->userUUID,
                'object_id' => $data['object_id'],
                'details' => $data['details'],
            ],
            '%s'
        );

        if (!$success) {
            throw new TapestryError('FAILED_TO_LOG_ANALYTICS');
        }
    }

    public function createSchema()
    {
        global $wpdb;

        add_option('tapestry_analytics_schema_version', '0.1');

        // Create table for logging events
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $this->tableName;
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
                    id mediumint(9) NOT NULL AUTO_INCREMENT,
                    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    actor VARCHAR(60) NOT NULL,
                    action VARCHAR(60) NOT NULL,
                    object VARCHAR(255) NOT NULL,
                    userUUID VARCHAR(60),
                    object_id VARCHAR(60),
                    details VARCHAR(255),
                    PRIMARY KEY  (id)
                ) $charset_collate;";

        require_once ABSPATH.'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    /**
     * Return an existing user UUID stored in a cookie if one exists.
     * Otherwise create a user UUID, store it in a cookie, and return that UUID.
     *
     * @return string
     */
    private function getUserUUID()
    {
        if (isset($_COOKIE[$this->cookieName])) {
            return $_COOKIE[$this->cookieName];
        } else {
            $userUUID = $this->createUUID();
            setcookie('tapestry_guid', $userUUID, time() + 31556926);

            return $userUUID;
        }
    }

    /**
     * Create a uuid.
     *
     * @return string
     */
    private function createUUID()
    {
        $uuid = preg_replace_callback('/x/', function () {
            $rand = (mt_rand() / mt_getrandmax() * 16 | 0) ^ 0x3;
            $rand = base_convert($rand, 10, 16);

            return strval($rand);
        }, 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
        $uuid = preg_replace_callback('/y/', function () {
            $rand = (mt_rand() / mt_getrandmax() * 16 | 0) ^ 0x8;
            $rand = base_convert($rand, 10, 16);

            return strval($rand);
        }, $uuid);

        return $uuid;
    }
}
