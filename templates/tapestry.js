/* jshint esversion: 6 */

function tapestryTool(config){
} // END OF TAPESTRY TOOL CLASS

/*******************************************************
 * 
 * PROTOTYPE FUNCTIONS (accessible from outside class)
 * 
 *******************************************************/

tapestryTool.prototype.initialize = function (isReload = false) {
    return this.init(isReload);
};

tapestryTool.prototype.reinitialize = function () {
    return this.init(true);
};

tapestryTool.prototype.getDataset = function() {
    return this.dataset;
};

tapestryTool.prototype.setDataset = function(newDataset) {
    this.dataset = newDataset;
    this.resetNodeCache();
};

tapestryTool.prototype.setOriginalDataset = function (dataset) {
    this.originalDataset = dataset;
};

tapestryTool.prototype.deleteNodeFromTapestry = function() {
    this.tapestryDeleteNode();
 };

tapestryTool.prototype.updateMediaIcon = updateMediaIcon;

tapestryTool.prototype.updateNodeImage = updateNodeImage;

/*******************************************************
 * 
 * NON-CLASS FUNCTIONS (could be moved to a separate file)
 * 
 *******************************************************/

function updateNodeImage(id, src) {
    const image = document.querySelector(`#node-thumb-${id} > image`)
    image.setAttribute("href", src)
}

function updateNodeLockedImage(id, src) {
    const image = document.querySelector(`#node-locked-thumb-${id} > image`)
    image.setAttribute("href", src)
}

// Updates the icon for the given media button
function updateMediaIcon(id, mediaType, action) {

    var buttonElementId = "#mediaButtonIcon" + id;
    var classStr = getIconClass(mediaType, action);

    $(buttonElementId).removeAttr('style');
    $(buttonElementId).attr('class', classStr);
}

// Helper function for getting the name for the Font Awesome icons
function getIconClass(mediaType, action, accessible=true) {

    var classStrStart = 'fas fa-';
    var classStr = '';

    if (!accessible) {
        return classStrStart + 'lock';
    }

    if (action == 'loading') {
        return 'mediaButtonLoading';
    }

    switch (mediaType) {

        case "h5p":
        case "video":
            if (action == 'pause')
                classStr = classStrStart + 'pause';
            else
                classStr = classStrStart + 'play';
            break;

        case "add":
            classStr = classStrStart + 'plus';
            break;
            
        case "text":
            classStr = 'textMediaButtonIcon';
            break;

        case "activity":
        case "gravity-form":
            classStr = classStrStart + 'tasks';
            break;

        case "url-embed":
            classStr = classStrStart + 'window-maximize';
            break;

        case "wp-post":
            classStr = "fab fa-wordpress-simple";
            break;

        case "accordion":
            classStr = "fas fa-bars";
            break;

        default:
            classStr = classStrStart + 'exclamation';
            break;
    }

    return classStr;
}

// Helper for converting the screen coordinates to SVG coordinates
function screenToSVG(screenX, screenY) {
    var svg = document.getElementById("tapestry-svg");
    var p = svg.createSVGPoint();
    p.x = screenX;
    p.y = screenY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
}

/****************************************************
 * ANALYTICS FUNCTIONS
 ****************************************************/

var analyticsAJAXUrl = '',  // e.g. '/wp-admin/admin-ajax.php' (set to empty string to disable analytics)
    analyticsAJAXAction = 'tapestry_tool_log_event';// Analytics

function recordAnalyticsEvent(actor, action, object, objectID, details){

    if (!analyticsAJAXUrl.length || !analyticsAJAXAction.length)
        return false;

    // TODO: Also need to save the tapestry slug or ID in the events

    var userUUID = Cookies.get("user-uuid");
    if (userUUID === undefined) {
        userUUID = createUUID();
        Cookies.set("user-uuid", userUUID);
    }

    if (details === undefined) {
        details = {};
    }

    details['user-ip'] = $('#user-ip').text();

    var data = {
        'action': analyticsAJAXAction,
        'actor': actor,
        'action2': action,
        'object': object,
        'user_guid': userUUID,
        'object_id': objectID,
        'details': JSON.stringify(details),
    };

    // Send the event to an AJAX URL to be saved
    $.post(analyticsAJAXUrl, data, function(response) {
        // Event posted
    });
}

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function isEmptyObject(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// Capture click events anywhere inside or outside tapestry
$(document).ready(function(){
    document.body.addEventListener('click', function(event) {
        var x = event.clientX + $(window).scrollLeft();
        var y = event.clientY + $(window).scrollTop();
        recordAnalyticsEvent('user', 'click', 'screen', null, {'x': x, 'y': y});
    }, true);

    document.getElementById('tapestry').addEventListener('click', function(event) {
        var x = event.clientX + $(window).scrollLeft();
        var y = event.clientY + $(window).scrollTop();
        recordAnalyticsEvent('user', 'click', 'tapestry', null, {'x': x, 'y': y});
    }, true);
});