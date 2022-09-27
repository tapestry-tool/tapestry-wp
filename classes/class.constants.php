<?php

class ConditionTypes
{
    public const NODE_COMPLETED = 'node_completed';
    public const DATE_NOT_PASSED = 'date_not_passed';
    public const DATE_PASSED = 'date_passed';
}

class NodeStatus
{
    public const PUBLISH = 'publish';
    public const DRAFT = 'draft';
    public const SUBMIT = 'submitted';
    public const REJECT = 'rejected';
    public const ACCEPT = 'accepted';
}

class CommentTypes
{
    public const COMMENT = 'Comment';
    public const STATUS_CHANGE = 'StatusChange';
}

class UserActions
{
    public const READ = 'read';
    public const ADD = 'add';
    public const EDIT = 'edit';
    public const MOVE = 'move';
}
