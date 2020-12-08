<?php

class ConditionTypes
{
    const NODE_COMPLETED = 'node_completed';
    const DATE_NOT_PASSED = 'date_not_passed';
    const DATE_PASSED = 'date_passed';
}

class NodeStatus
{
    const PUBLISH = 'publish';
    const DRAFT = 'draft';
    const SUBMIT = 'submitted';
    const REJECT = 'reject';
    const ACCEPT = 'accept';
}

class CommentTypes
{
    const COMMENT = 'Comment';
    const STATUS_CHANGE = 'StatusChange';
}
