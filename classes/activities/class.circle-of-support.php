<?php

class CircleOfSupport
{
    private $userId;
    private $versions;

    const META_KEY = 'tyde_circle_of_support';

    public function __construct($userId = 0)
    {
        if (!$userId) {
            $userId = wp_get_current_user()->ID;
        }

        $this->userId = $userId;
        $this->versions = $this->_getVersions();
    }

    public function get($date = 0)
    {
        if ($date) {
            foreach ($this->versions as $version) {
                if ($this->_isSameDay($version->timestamp, $date)) {
                    return $version;
                }
            }

            return null;
        }

        if (0 === count($this->versions)) {
            return null;
        }

        return $this->versions[count($this->versions) - 1];
    }

    public function save($circleOfSupport)
    {
        $latest = $this->get();

        if (!isset($latest)) {
            array_push($this->versions, $circleOfSupport);
        } else {
            if ($this->_isSameDay($latest->timestamp, $circleOfSupport->timestamp)) {
                $this->versions[count($this->versions) - 1] = $circleOfSupport;
            } else {
                array_push($this->versions, $circleOfSupport);
            }
        }

        return update_user_meta($this->userId, CircleOfSupport::META_KEY, $this->versions);
    }

    private function _getVersions()
    {
        $versions = get_user_meta($this->userId, CircleOfSupport::META_KEY, true);
        if (!is_array($versions)) {
            return [];
        }

        return array_map(function ($cos) {
            return json_decode($cos);
        }, $versions);
    }

    private function _isSameDay($date1, $date2)
    {
        return date_format(new DateTime($date1), 'Ymd') == date_format(new DateTime($date2), 'Ymd');
    }
}
