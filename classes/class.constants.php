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

class KalturaUpload
{
    // When updating STOP_UPLOAD_OPTION, autoload should be set to false
    // so that we can clear the option from the cache when needed
    public const STOP_UPLOAD_OPTION = 'tapestry_kaltura_stop_upload_requested';

    public const IN_PROGRESS_OPTION = 'tapestry_kaltura_upload_in_progress';
    public const LATEST_TAPESTRY_OPTION = 'tapestry_kaltura_upload_tapestry_id';
    public const UPLOAD_LOG_OPTION = 'tapestry_kaltura_upload_log';
    public const UPLOAD_ERROR_OPTION = 'tapestry_kaltura_upload_error';
    public const YES_VALUE = 'yes';
    public const NO_VALUE = 'no';
    public const UPLOAD_BATCH_SIZE = 10;
}

class UploadStatus
{
    public const NOT_STARTED = 'Not started';
    public const UPLOADING = 'Uploading';
    public const CONVERTING = 'Converting';
    public const COMPLETE = 'Complete';
    public const CANCELED = 'Canceled';
    public const ERROR = 'Error';
}
