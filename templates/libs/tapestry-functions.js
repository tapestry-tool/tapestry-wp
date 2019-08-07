
// Functionality for the X button that closes the media and the light-box
function closeLightbox(id, mediaType) {

    // Pause the H5P video before closing it. This will also trigger saving of the settings
    // TODO: Do this for HTML5 video as well
    // var h5pObj = document.getElementById('h5p').contentWindow.H5P;
    // if (h5pObj !== undefined && mediaType == "video") {
    // var h5pVideo = h5pObj.instances[0].video;
    // h5pVideo.pause();
    // }

    if (document.getElementById('h5p') !== null) {
        var h5pObj = document.getElementById('h5p').contentWindow.H5P;
        if (h5pObj !== undefined && mediaType == "video") {
            var h5pVideo = h5pObj.instances[0].video;
            if (typeof h5pVideo != "undefined" && typeof h5pVideo.pause !== "undefined") {
                h5pVideo.pause();
            }
        }
    }

    updateMediaIcon(id, mediaType, 'play');

    $('#spotlight-overlay').remove();
    $('#spotlight-content').css('opacity', 0);

    // wait for css animation before removing it
    setTimeout(function () {
        $('#spotlight-content').remove();
    }, 1000);

    recordAnalyticsEvent('user', 'close', 'lightbox', id);
}

// Updates the icon for the given media button
function updateMediaIcon(id, mediaType, action) {

    var buttonElementId = "#mediaButtonIcon" + id;
    var classStr = getIconClass(mediaType, action);

    $(buttonElementId).removeAttr('style');
    $(buttonElementId).attr('class', classStr);
}

// Helper function for getting the name for the Font Awesome icons
function getIconClass(mediaType, action) {

    var classStrStart = 'fas fa-';
    var classStrEnd = '-circle';
    var classStr = '';

    if (action == 'loading') {
        return 'mediaButtonLoading';
    }

    switch (mediaType) {

        case "video":
            if (action == 'pause')
                classStr = classStrStart + 'pause' + classStrEnd;
            else
                classStr = classStrStart + 'play' + classStrEnd;
            break;

        case "add":
            classStr = classStrStart + 'plus' + classStrEnd;
            break;

        case "text":
            classStr = classStrStart + 'bars';
            break;

        default:
            classStr = classStrStart + 'exclamation' + classStrEnd;
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

function recordAnalyticsEvent(actor, action, object, objectID, details) {

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
        'details': JSON.stringify(details)
    };

    // Send the event to an AJAX URL to be saved
    jQuery.post(analyticsAJAXUrl, data, function (response) {
        // Event posted
    });
}

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function isEmptyObject(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function onlyContainsDigits(string) {
    var regex = new RegExp(/^\d+$/);
    return regex.test(string);
}

function extractDigitsFromString(string) {
    return string.replace(/[^0-9]/g, '');
}

function tapestryValidateNewNode(formData, isRoot) {

    if (typeof isRoot == 'undefined') {
        isRoot = false;
    }

    var errMsg = "";

    for (var i = 0; i < formData.length; i++) {
        var fieldName = formData[i].name;
        var fieldValue = formData[i].value;

        switch (fieldName) {
            case "title":
                if (fieldValue === "") {
                    errMsg += "Please enter a title \n";
                }
                break;
            case "imageURL":
                if (fieldValue === "") {
                    errMsg += "Please enter a thumbnail URL \n";
                }
                break;
            case "appearsAt":
                if (fieldValue.length > 0 && !onlyContainsDigits(fieldValue) && !isRoot) {
                    errMsg += "Please enter numeric value for Appears At (or leave empty to not lock) \n";
                }
                break;
            default:
                break;
        }

        if ($("#mediaFormat").val() === "mp4") {
            switch (fieldName) {
                case "mp4-mediaURL":
                    if (fieldValue === "") {
                        errMsg += "Please enter a MP4 video URL \n";
                    }
                    break;
                case "mp4-mediaDuration":
                    if (!onlyContainsDigits(fieldValue)) {
                        errMsg += "Please enter numeric value for media duration \n";
                    }
                    break;
                default:
                    break;
            }
        } else if ($("#mediaFormat").val() === "h5p") {
            switch (fieldName) {
                case "h5p-mediaURL":
                    if (fieldValue === "") {
                        errMsg += "Please enter a H5P URL \n";
                    }
                    break;
                case "h5p-mediaDuration":
                    if (!onlyContainsDigits(fieldValue)) {
                        errMsg += "Please enter numeric value for media duration \n";
                    }
                    break;
                default:
                    break;
            }
        }
    }
    return errMsg;
}

// Resets the add/edit modal to default state
function tapestryHideAddNodeModal() {
    // Clear all text fields
    $("#createNewNodeModalBody input[type='text']").val("");
    $("#createNewNodeModalBody input[type='url']").val("");
    // Remove Text Area for text node 
    $("#tapestry-node-text-area").val("");
    $(".permissions-dynamic-row").remove(); // remove the dynamically created permission rows
    // Uncheck all public permissions except read
    $('.public-checkbox').each(function () {
        if ($(this).is(":checked") && this.name !== "read") {
            $(this).prop('checked', false);
        }
    });
    $("#createNewNodeModal").modal("hide");

    // Reset all selections for dropdowns
    $("#mediaType").val("default");
    // Enable media type because edit disables it
    $("#mediaType").removeAttr('disabled');

    // Uncheck lock node label and hide appears at input
    $("#tapestry-lock-node-checkbox").prop('checked', false);
    $("#appears-at-label").hide();

    $("#tapestry-text-content").hide();
    $("#mp4-content").hide();
    $("#h5p-content").hide();
    $("#appearsat-section").show();
}

/* Finds the node index with node ID */
function findNodeIndex(id) {
    function helper(obj) {
        return obj.id == id;
    }

    return tapestry.dataset.nodes.findIndex(helper);
}
