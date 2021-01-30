<?php

class ConditionTypes
{
    const NODE_COMPLETED = 'node_completed';
    const DATE_NOT_PASSED = 'date_not_passed';
    const DATE_PASSED = 'date_passed';
}

class TydeTypes
{
    const REGULAR = 'Regular';
    const MODULE = 'Module';
    const STAGE = 'Stage';
    const QUESTION_SET = 'Question set';
}

class NodeStatus
{
    const PUBLISH = 'publish';
    const DRAFT = 'draft';
    const SUBMIT = 'submitted';
    const REJECT = 'rejected';
    const ACCEPT = 'accepted';
}

class CommentTypes
{
    const COMMENT = 'Comment';
    const STATUS_CHANGE = 'StatusChange';
}
