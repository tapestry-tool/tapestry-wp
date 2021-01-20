<?php

class CircleOfSupport
{
    private $userId;
    private $versions;
    private $current;

    const META_KEY = 'tyde_circle_of_support';

    public function __construct($userId = 0)
    {
        if (!$userId) {
            $userId = wp_get_current_user()->ID;
        }

        $this->userId = $userId;
        $this->versions = $this->_getVersions();
        $this->current = $this->get();
    }

    public function addConnection($connection)
    {
        $id = uniqid();
        $connection->id = $id;
        $this->current->connections->$id = $connection;

        return $connection;
    }

    public function updateConnection($id, $connection)
    {
        $this->current->connections->$id = $connection;

        return $connection;
    }

    public function get()
    {
        if ($this->_isEmpty()) {
            return $this->_getDefaultCos();
        }

        return $this->versions[count($this->versions) - 1];
    }

    public function getByDate($date)
    {
        foreach ($this->versions as $version) {
            if ($this->_isSameDay($version->timestamp, $date)) {
                return $version;
            }
        }

        return null;
    }

    public function save($circleOfSupport = null)
    {
        if (!$circleOfSupport) {
            $circleOfSupport = $this->current;
        }

        $circleOfSupport->id = $this->userId;
        $now = date_format(new DateTime(), DateTime::ISO8601);

        if ($this->_isEmpty()) {
            array_push($this->versions, $circleOfSupport);
        } else {
            if ($this->_isSameDay($this->current->timestamp, $now)) {
                $this->versions[count($this->versions) - 1] = $circleOfSupport;
            } else {
                array_push($this->versions, $circleOfSupport);
            }
        }

        $this->current = $this->get();
        update_user_meta($this->userId, CircleOfSupport::META_KEY, $this->versions);

        return $this->current;
    }

    private function _getDefaultCos()
    {
        return [
            'id' => $this->userId,
            'connections' => new stdClass(),
            'communities' => new stdClass(),
            'circles' => [],
            'members' => new stdClass(),
            'timestamp' => date_format(new DateTime(), DateTime::ISO8601),
        ];
    }

    private function _getVersions()
    {
        $versions = get_user_meta($this->userId, CircleOfSupport::META_KEY, true);
        if (!is_array($versions)) {
            return [];
        }

        return $versions;
    }

    private function _isEmpty()
    {
        return 0 === count($this->versions);
    }

    private function _isSameDay($date1, $date2)
    {
        return date_format(new DateTime($date1), 'Ymd') == date_format(new DateTime($date2), 'Ymd');
    }
}
