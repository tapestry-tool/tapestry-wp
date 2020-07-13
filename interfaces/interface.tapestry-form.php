<?php

/**
 * Tapestry Gravity Forms Interface.
 */
interface ITapestryForm
{
    /**
     * Get all created gravity forms.
     *
     * @return string all forms in json format
     */
    public function getAll();

    /**
     * Get the latest entry for the given form id for
     * the current logged in user.
     *
     * @return object the corresponding entry
     */
    public function getEntry($formId);
}
