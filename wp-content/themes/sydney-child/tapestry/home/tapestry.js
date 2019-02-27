(function(){

/****************************************************
 * CONSTANTS AND GLOBAL VARIABLES
 ****************************************************/

const // declared
    PROGRESS_THICKNESS = 20,
    LINK_THICKNESS = 10,
    NORMAL_RADIUS = 140,
    ROOT_RADIUS_DIFF = 70,
    GRANDCHILD_RADIUS_DIFF = -100,
    TRANSITION_DURATION = 800,
    COLOR_STROKE = "#072d42",
    COLOR_GRANDCHILD = "#999",
    COLOR_LINK = "#666";

const // calculated
    BROWSER_WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    BROWSER_HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.8,
    ASPECT_RATIO = BROWSER_WIDTH / BROWSER_HEIGHT,
    MAX_RADIUS = NORMAL_RADIUS + ROOT_RADIUS_DIFF + 30,     // 30 is to count for the icon
    INNER_RADIUS = NORMAL_RADIUS - (PROGRESS_THICKNESS / 2),
    OUTER_RADIUS = NORMAL_RADIUS + (PROGRESS_THICKNESS / 2);

var dataset, root, svg, svgScale, links, nodes,   // Basics
    path, pieGenerator, arcGenerator,             // Donut
    linkForce, collideForce, force,               // Force
    tapestryWidth, tapestryHeight,
    saveProgressToCookie = false,
    NODE_IMAGE_HEIGHT = 350,
    NODE_IMAGE_WIDTH = 700,
    ROOT_NODE_IMAGE_HEIGHT_DIFF = 70;

/****************************************************
 * INITIALIZATION
 ****************************************************/

//---------------------------------------------------
// 1. GET THE DATA READY
//---------------------------------------------------

// Import data from json file, then start D3
$.getJSON(siteUrl + 'tapestry.json', function(result){

    dataset = result;

    if (saveProgressToCookie) {
        // Update dataset with data from cookie (if any)
        var cookieProgress = Cookies.get("progress-data-"+TAPESTRY_SLUG);
        if (cookieProgress !== undefined) {
            cookieProgress = JSON.parse( cookieProgress );
            setDatasetProgress(cookieProgress);
        }
    }

    var maxPointX = 0;
    var maxPointY = 0;
    for (var index in dataset.nodes) {

        // save max point so we can calculate our tapestry width and height
        if (dataset.nodes[index].fx > maxPointX) {
            maxPointX = dataset.nodes[index].fx;
        }
        if (dataset.nodes[index].fy > maxPointY) {
            maxPointY = dataset.nodes[index].fy;
        }

        // make the graph vertical if aspect ratio is portrait
        if (ASPECT_RATIO < 1) {
            var temp_fx = dataset.nodes[index].fy;
            dataset.nodes[index].fy = dataset.nodes[index].fx;
            dataset.nodes[index].fx = temp_fx;
        }
    }
    if (ASPECT_RATIO < 1) {
        var maxPointSwap = maxPointX;
        maxPointX = maxPointY;
        maxPointY = maxPointX;
    }

    root = dataset.rootId,

    setNodeTypes(dataset.rootId);
    setLinkTypes(dataset.rootId);

    //---------------------------------------------------
    // 2. CREATE THE SVG OBJECTS
    //---------------------------------------------------

    if (dataset.settings !== undefined && dataset.settings.thumbDiff !== undefined) {
        NODE_IMAGE_HEIGHT += dataset.settings.thumbDiff;
        ROOT_NODE_IMAGE_HEIGHT_DIFF += dataset.settings.thumbDiff;
    }
    if (dataset.settings !== undefined && dataset.settings.thumbRootDiff !== undefined) {
        ROOT_NODE_IMAGE_HEIGHT_DIFF += dataset.settings.thumbRootDiff;
    }

    svgScale = 1;
    if (dataset.settings !== undefined && dataset.settings.zoom !== undefined) {
        svgScale *= dataset.settings.zoom;
    }
    if (window.devicePixelRatio !== undefined && window.devicePixelRatio > 1.5) {
        svgScale *= (window.devicePixelRatio/1.5);
    }
    tapestryWidth = (maxPointX + (NORMAL_RADIUS + ROOT_RADIUS_DIFF)*2) *  svgScale;
    tapestryHeight = (maxPointY + (NORMAL_RADIUS + ROOT_RADIUS_DIFF)*2) * svgScale;

    svg = createSvgContainer("tapestry");
    links = createLinks();
    nodes = createNodes();

    filterLinks();

    buildNodeContents();

//---------------------------------------------------
// 3. START THE FORCED GRAPH
//---------------------------------------------------

startForce();

});

/****************************************************
 * D3 RELATED FUNCTIONS
 ****************************************************/

/* Define forces that will determine the layout of the graph */
function startForce() {
    linkForce = d3.forceLink()
        .id(function (d) {
            return d.id;
        });

    collideForce = d3.forceCollide(
        function (d) {
            return getRadius(d) * 1.2;
        });

    force = d3.forceSimulation()
        .force("link", linkForce)
        .force('collide', collideForce)
        .force("charge", d3.forceManyBody().strength(-5000))
        .force('center', d3.forceCenter(tapestryWidth / 2, tapestryHeight / 2));

    force
        .nodes(dataset.nodes)
        .on("tick", ticked);

    force
        .force("link")
        .links(dataset.links);
}

//Resize all nodes, where id is now the root
function resizeNodes(id) {

    setNodeTypes(id);
    setLinkTypes(id);
    filterLinks();

    rebuildLinks();
    rebuildNodeContents();

    /* Restart force */
    startForce();
}

function ticked() {
    links
        .attr("x1", function (d) {
            return getBoundedCoord(d.source.x, tapestryWidth);
        })
        .attr("y1", function (d) {
            return getBoundedCoord(d.source.y, tapestryHeight);
        })
        .attr("x2", function (d) {
            return getBoundedCoord(d.target.x, tapestryWidth);
        })
        .attr("y2", function (d) {
            return getBoundedCoord(d.target.y, tapestryHeight);
        });
    nodes
        .attr("cx", function (d) {
            return getBoundedCoord(d.x, tapestryWidth);
        })
        .attr("cy", function (d) {
            return getBoundedCoord(d.y, tapestryHeight);
        })
        .attr("transform", function (d) {
            return "translate(" + getBoundedCoord(d.x, tapestryWidth) + "," + getBoundedCoord(d.y, tapestryHeight) + ")";
        });
}

function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.2).restart();
    d.fx = getBoundedCoord(d.x, tapestryWidth);
    d.fy = getBoundedCoord(d.y, tapestryHeight);
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
//    if (!d3.event.active) simulation.alphaTarget(0);
    if (!d3.event.active) force.alphaTarget(0);
    d.fx = d.x;
    d.fy = d.y;
}

function createSvgContainer(containerId) {
    return d3.select("#"+containerId)
                .append("svg:svg")
                .attr("viewBox", "0 0 " + tapestryWidth + " " + tapestryHeight)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .append("svg:g")
                .attr("transform", "translate(-20, 0)");
}

function createLinks() {
    /* Need to remove old links when redrawing graph */
    return svg.append("svg:g")
               .attr("class", "links")
               .selectAll("line")
               .data(dataset.links)
                  .enter()
                    .append("line")
                    .attr("stroke", function (d) {
                        if (d.type === "grandchild") return COLOR_GRANDCHILD;
                        else return COLOR_LINK;
                    })
                    .attr("stroke-width", LINK_THICKNESS);
}

function createNodes() {
    /* Need to remove old nodes when redrawing graph */
    return svg.selectAll("g.node")
              .data(dataset.nodes)
              .enter()
                .append("svg:g")
                    .attr("class", "node")
                    .attr("id", function (d) {
                        return "node-" + d.id;
                    });
}

// TODO: Get rid of this function (use buildNodeContents and rebuildNodeContents instead)
function filterLinks() {
    var linksToHide = links.filter(function (d) {
        var sourceId, targetId;
        if (typeof d.source === 'number' && typeof d.target === 'number') {
            sourceId = d.source;
            targetId = d.target;
        } else if (typeof d.source === 'object' && typeof d.target === 'object') {
            sourceId = d.source.id;
            targetId = d.target.id;
        }

        var shouldRender = false;
        if (sourceId === root || targetId === root) {
            shouldRender = true;
        } else if (getChildren(root).indexOf(sourceId) > -1 || getChildren(root).indexOf(targetId) > -1) {
            shouldRender = true;
        }
        return !shouldRender;
    });

    var linksToShow = links.filter(function (d) {
        var sourceId, targetId;
        if (typeof d.source === 'number' && typeof d.target === 'number') {
            sourceId = d.source;
            targetId = d.target;
        } else if (typeof d.source === 'object' && typeof d.target === 'object') {
            sourceId = d.source.id;
            targetId = d.target.id;
        }

        var shouldRender = false;
        if (sourceId === root || targetId === root) {
            shouldRender = true;
        } else if (getChildren(root).indexOf(sourceId) > -1 || getChildren(root).indexOf(targetId) > -1) {
            shouldRender = true;
        }

        return shouldRender;
    });

    linksToShow
        .style("display", "block");

    linksToHide
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", "0");

    linksToShow
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", "1");

    setTimeout(function(){
        linksToHide
            .style("display", "block");
    }, TRANSITION_DURATION);
}

/* Draws the components that make up node */
function buildNodeContents() {

    /* Draws the circle that defines how large the node is */
    nodes.append("rect")
        .attr("class", function (d) {
            if (d.nodeType === "grandchild") return "imageContainer expandGrandchildren";
            return "imageContainer";
        })
        .attr("rx", function (d) {
            return getRadius(d);
        })
        .attr("ry", function (d) {
            return getRadius(d);
        })
        .attr("data-id", function (d) {
            return d.id;
        })
        .attr("stroke-width", function (d) {
            return PROGRESS_THICKNESS;
        })
        .attr("stroke", function (d) {
            if (d.nodeType === "")
                return "transparent";
            else if (d.nodeType === "grandchild")
                return COLOR_GRANDCHILD;
            else return COLOR_STROKE;
        })
        .attr("width", function (d) {
            if (d.nodeType === "") return 0;
            return getRadius(d) * 2;
        })
        .attr("height", function (d) {
            if (d.nodeType === "") return 0;
            return getRadius(d) * 2;
        })
        .attr("x", function (d) {
            return - getRadius(d);
        })
        .attr("y", function (d) {
            return - getRadius(d);
        })
        .attr("fill", function (d) {
            return "url('#node-thumb-" + d.id + "')";
        });

    nodes.append("circle")
        .attr("class", "imageOverlay")
        .attr("data-id", function (d) {
            return d.id;
        })
        .attr("stroke-width", function () {
            return PROGRESS_THICKNESS;
        })
        .attr("r", function (d) {
            return getRadius(d);
        })
        .attr("fill", function (d) {
            if (d.nodeType === "")
                return "transparent";
            else if (d.nodeType === "grandchild")
                return COLOR_GRANDCHILD;
            else return COLOR_STROKE;
        });

    /* Attach images to be used within each node */
    nodes.append("defs")
        .append("pattern")
        .attr("id", function (d) {
            return "node-thumb-" + d.id;
        })
        .attr("data-id", function (d) {
            return d.id;
        })
        .attr("pattenUnits", "userSpaceOnUse")
        .attr("height", 1)
        .attr("width", 1)
        .append("image")
        .attr("height", function (d) {
            if (d.nodeType === "root") {
                return NODE_IMAGE_HEIGHT + ROOT_NODE_IMAGE_HEIGHT_DIFF;
            } else return NODE_IMAGE_HEIGHT;
        })
        .attr("width", NODE_IMAGE_WIDTH)
        .attr("x", 0)
        .attr("y", 0)
        .attr("preserveAspectRatio", "xMinYMin")
        .attr("xlink:href", function (d) {
            return d.imageURL;
        });

    /* Add path and button */
    buildPathAndButton();

    /* Add dragging and node selection functionality to the node */
    nodes.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
        .on("click", function (d) {
            resizeNodes(d.id);
        });
}

function rebuildNodeContents() {

    nodes.selectAll(".imageOverlay")
            .transition()
            .duration(TRANSITION_DURATION/3)
            .attr("r", function (d) {
                return getRadius(d);
            })
            .attr("fill", function (d) {
                if (d.nodeType === "")
                    return "transparent";
                else if (d.nodeType === "grandchild")
                    return COLOR_GRANDCHILD;
                else return COLOR_STROKE;
            });

    nodes.selectAll(".imageContainer")
            .attr("class", function (d) {
                if (d.nodeType === "grandchild" || d.nodeType === "")
                    return "imageContainer expandGrandchildren";
                else return "imageContainer";
            })
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("rx", function (d) {
                return getRadius(d);
            })
            .attr("ry", function (d) {
                return getRadius(d);
            })
            .attr("stroke", function (d) {
                if (d.nodeType === "")
                    return "transparent";
                else if (d.nodeType === "grandchild")
                    return COLOR_GRANDCHILD;
                else return COLOR_STROKE;
            })
            .attr("width", function (d) {
                return getRadius(d) * 2;
            })
            .attr("height", function (d) {
                return getRadius(d) * 2;
            })
            .attr("x", function (d) {
                return - getRadius(d);
            })
            .attr("y", function (d) {
                return - getRadius(d);
            })
            .attr("fill", function (d) {
                return "url('#node-thumb-" + d.id + "')";
            });

    /* Attach images to be used within each node */
    nodes.selectAll("defs")
         .selectAll("pattern")
         .selectAll("image")
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("height", function (d) {
                if (d.nodeType === "root") {
                    return NODE_IMAGE_HEIGHT + ROOT_NODE_IMAGE_HEIGHT_DIFF;
                } else return NODE_IMAGE_HEIGHT;
            });

    // Remove elements and add them back in
    nodes.selectAll("text").remove();
    nodes.selectAll(".mediaButton").remove();
    nodes.selectAll("path").remove();
    setTimeout(function(){
        buildPathAndButton();
    }, TRANSITION_DURATION);

}

function buildPathAndButton() {

    /* Add progress pie inside each node */
    pieGenerator = d3.pie().sort(null).value(function (d) {
        return d.value;
    });
    arcGenerator = d3.arc().startAngle(0);

    /* Update the progress pies */
    updateViewedProgress();

    nodes
        .filter(function (d) {
            return d.nodeType !== ""
        })
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("data-id", function (d) {
            return d.id;
        })
        .text(function (d) {
            return d.title;
        })
        .attr("style", function (d) {
            return d.nodeType === "grandchild" ? "visibility: hidden" : "visibility: visible";
        });

    nodes
        .filter(function (d) {
            return d.nodeType !== ""
        })
        .append("svg:foreignObject")
        .html(function (d) {
            var mediaURL = d.typeData.mediaURL;
            var iconName;
            if (d.mediaType === "video") {
                iconName = "fa-play-circle";
            } else {
                iconName = "fa-exclamation-circle";
            }
            return '<i id="mediaButtonIcon' + d.id + '" class="fas ' + iconName + ' mediaButtonIcon" data-id="' + d.id + '" data-format="' + d.mediaFormat + '" data-thumb="' + d.imageURL + '" data-url="' + mediaURL + '"><\/i>';
        })
        .attr("id", function (d) {
            return "mediaButton" + d.id;
        })
        .attr("data-id", function (d) {
            return d.id;
        })
        .attr("width", "60px")
        .attr("height", "62px")
        .attr("x", -27)
        .attr("y", function (d) {
            return -NORMAL_RADIUS - 30 - (d.nodeType === "root" ? ROOT_RADIUS_DIFF : 0);
        })
        .attr("style", function (d) {
            return d.nodeType === "grandchild" ? "visibility: hidden" : "visibility: visible";
        })
        .attr("class", "mediaButton");

    $('.mediaButton > i').click(function(){
        var thisBtn = $(this)[0];
        setupLightbox(thisBtn.dataset.id, thisBtn.dataset.format, thisBtn.dataset.mediaType, thisBtn.dataset.url);
        });
    }

function rebuildLinks() {
    links = d3.selectAll("line")
        .attr("stroke", function (d) {
            if (d.type === "grandchild") return COLOR_GRANDCHILD;
            else return COLOR_LINK;
        })
        .attr("stroke-width", LINK_THICKNESS);
}

function updateViewedProgress() {
    path = nodes
        .filter(function (d) {
            return d.nodeType !== ""
        })
        .selectAll("path")
        .data(function (d, i) {
            var data = d.typeData.progress;
            data.forEach(function (e) {
                e.extra = {'nodeType': d.nodeType}
            })
            return pieGenerator(data, i);
        });

    path.transition().duration(750).attrTween("d", arcTween);

    path.enter()
        .append("path")
        .attr("fill", function (d, i) {
            if (d.data.group !== "viewed") return "transparent";
            if (d.data.extra.nodeType === "grandchild" || d.data.extra.nodeType === "")
                return "#cad7dc";
            else return "#11a6d8";
        })
        .attr("class", function (d) {
            if (d.data.extra.nodeType === "grandchild" || d.data.extra.nodeType === "")
                return "expandGrandchildren";
        })
        .attr("d", function (d) {
            return arcGenerator(adjustProgressBarRadii(d));
        });
}

function arcTween(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(1);
    return (t) => {
        return arcGenerator(adjustProgressBarRadii(i(t)))
    };
}

function adjustProgressBarRadii(d) {
    var addedRadius = 0;
    var addedRadiusInner = 0;
    if (d.data.extra.nodeType === "root")
        addedRadius = ROOT_RADIUS_DIFF;
    if (d.data.extra.nodeType === "grandchild") {
        addedRadius = GRANDCHILD_RADIUS_DIFF;
        addedRadiusInner = -1 * (INNER_RADIUS + addedRadius); // set inner radius to 0
    }
    arcGenerator.innerRadius(INNER_RADIUS + addedRadius + addedRadiusInner)(d);
    arcGenerator.outerRadius(OUTER_RADIUS + addedRadius)(d);
    return d;
}

/****************************************************
 * MEDIA RELATED FUNCTIONS
 ****************************************************/

function setupLightbox(id, mediaFormat, mediaType, videoLink) {

    // TODO: Add in close button and add a listener for it here
    $('#video').attr("onclick", "closeLightbox(" + id + "," + mediaType +")");

    var video = setupVideo(id, mediaFormat, mediaType, videoLink);

    //For revealing the lightbox and video
    $('.lightbox').css('display', 'block');
    setTimeout(function () {
        //$('.lightbox').css('opacity', 1);
    }, 10);

    var spPos = $('.imageOverlay[data-id=' + id + ']').position();

    // Get the width & height of the node
    var spotlightWidth = NORMAL_RADIUS;
    var spotlightHeight = NORMAL_RADIUS
    if (id == root) {
        spotlightWidth += ROOT_RADIUS_DIFF;
        spotlightHeight += ROOT_RADIUS_DIFF;
    }
    //Set initial position for the node transition
    $('<div id="spotlight-content"><\/div>').css({
        // position: "absolute",
        // top: spPos.top,
        // left: spPos.left,
        // width: spotlightWidth - PROGRESS_THICKNESS,
        // height: spotlightHeight - PROGRESS_THICKNESS
    }).appendTo('body');
    $('#spotlight-content').css('opacity', 1).draggable({
        delay: 10,
        distance: 8
      });

    video.appendTo('#spotlight-content');

    video[0].addEventListener('load', function() {
        $('#spotlight-content').css( 'height', $(this).outerHeight() + 'px' );
    });

    var loadEventName;
    if (mediaFormat === "mp4") {
        loadEventName = "loadeddata";
    } else if (mediaFormat === "youtube") {
        loadEventName = "onloadeddata";
    }

    video[0].addEventListener(loadEventName, expandVideo(video, mediaFormat), false);
}

function expandVideo(video, mediaFormat) {
    // TODO: make the lightbox size responsive and do not hardcode the values
    var topPos = (BROWSER_HEIGHT - 540) / 2;
    var leftPos = (BROWSER_WIDTH - 960) / 2;

    //Video is loaded and can be played
    //Set the final position, size, and shape for the node transition
    var imageWidth = video.width();
    var imageHeight = video.height();
    setTimeout(function () {
        $('#spotlight-content').css({
            // width: imageWidth,
            // height: imageHeight,
            // top: topPos,
            // left: leftPos,
            "box-shadow": "0 0 800px #000",
            "border-radius": "0%",
            "background-position": "0px 0px"
        });

        // auto-play video for mp4 only; Youtube uses a tag attached to the end of video link ("?autoplay=1")
        if (mediaFormat === "mp4") {
            setTimeout(function () {
                video[0].play();
            }, 2000);
        }
    }, 100);
}

function setupVideo(id, mediaFormat, mediaType, videoLink) {
    console.log("HI");
    var buttonElementId = "#mediaButtonIcon" + id;
    // Add the loading gif
    $(buttonElementId).addClass('mediaButtonLoading');

    //Add videoplayer TODO: Make tag flexible between iframe and video
    var videoEl;
    // <script src="http://beta.tapestry-tool.com/wp-content/plugins/h5p/h5p-php-library/js/h5p-resizer.js" charset="UTF-8"></script>
    videoEl = $('<iframe id="' + mediaFormat + '" src="http://localhost:8888/tapestry/wordpress/wp-admin/admin-ajax.php?action=h5p_embed&id=1" width="960" height="549" frameborder="0" allowfullscreen="allowfullscreen"><\/iframe>');
    // <iframe src="http://localhost:8888/tapestry/wordpress/wp-admin/admin-ajax.php?action=h5p_embed&id=1" width="868" height="549" frameborder="0" allowfullscreen="allowfullscreen"></iframe><script src="http://localhost:8888/tapestry/wordpress/wp-content/plugins/h5p/h5p-php-library/js/h5p-resizer.js" charset="UTF-8"></script>

    var index = findNodeIndex(id);
    var viewedAmount;

    var video = videoEl[0];

    // Play video starting from the amount already viewed
    video.addEventListener('load', function() {
        var iframeH5P = document.getElementById('h5p').contentWindow.H5P;
        console.log(iframeH5P);
        var iframeVideo = iframeH5P.instances[0].video;

        // // Determining where to start the video
        // viewedAmount = dataset.nodes[index].typeData.progress[0].value * video.duration;
        // if (viewedAmount > 0) {
        //     if (viewedAmount !== video.duration) {
        //         video.currentTime = viewedAmount;
        //     } else video.currentTime = 1; //start from beginning again if person had already viewed whole video through
        // }
        // else {
        //     video.currentTime = 1;
        // }

        // Determining where to start the video FOR H5P ONLY
        viewedAmount = dataset.nodes[index].typeData.progress[0].value * video.duration;
        if (viewedAmount > 0) {
            if (viewedAmount !== iframeVideo.getDuration()) {
                iframeVideo.updateCurrentTime(viewedAmount);
            } else iframeVideo.updateCurrentTime(viewedAmount); //start from beginning again if person had already viewed whole video through
        }
        else {
            video.currentTime = 1;
        }

        iframeVideo.on('stateChanged', function (event) {
            switch (event.data) {
                case iframeH5P.Video.PLAYING:
                    $(buttonElementId).removeAttr('style');
                    $(buttonElementId).attr('class', 'fas fa-pause-circle');
                    break;

                case iframeH5P.Video.PAUSED:
                    var iconName;
                    if (mediaType === "video") {
                        iconName = "fa-play-circle";
                    } else {
                        iconName = "fa-exclamation-circle";
                    }
                    $(buttonElementId).attr('class', 'fas ' + iconName);
                    break;

                case iframeH5P.Video.BUFFERING:
                    $(buttonElementId).addClass('mediaButtonLoading');
                    break;
            }
        }, false);
    });

    // Update the viewedAmount of that video
    video.addEventListener('timeupdate', function () {
        if (video.played.length > 0 && viewedAmount < video.currentTime) {
            updateViewedValue(id, video.currentTime, video.duration);
            updateViewedProgress();
        }
    });

    return videoEl;
}

/****************************************************
 * HELPER FUNCTIONS
 ****************************************************/

// Finds the node index with node ID
function findNodeIndex(id) {
    function helper(obj) {
        return obj.id == id;
    }

    return dataset.nodes.findIndex(helper);
}

function getBoundedCoord(coord, maxCoord) {
    return Math.max(MAX_RADIUS, Math.min(maxCoord - MAX_RADIUS, coord));
}

function getChildren(id) {
    var children = [];
    var dataLinks = dataset.links;
    for (var linkId in dataLinks) {
        var link = dataLinks[linkId];
        //SEARCH FOR: CURRENT_ID_NODE -> CHILD links
        if (typeof link.source === 'number' && link.source === id) {
            children.push(link.target);
        } else if (typeof link.source === 'object' && link.source.id === id) {
            children.push(link.target.id);
        }

        //SEARCH FOR: PARENT -> CURRENT_ID_NODE links;
        // These should also appear as "children" because they're adjacent to the current node
        if (typeof link.target === 'number' && link.target === id) {
            children.push(link.source);
        } else if (typeof link.target === 'object' && link.target.id === id) {
            children.push(link.source.id);
        }
    }

    return children;
}

function getGrandchildren(children) {
    var grandchildren = [];
    for (var childId in children) {
        var child = children[childId];
        var currentGrandchildren = getChildren(child);
        grandchildren = grandchildren.concat(currentGrandchildren);
    }

    return grandchildren;
}

function getRadius(d) {
    var nodeDiff;
    if (d.nodeType === "") {
        return 0;
    } else if (d.nodeType === "root") {
        nodeDiff = ROOT_RADIUS_DIFF;
    } else if (d.nodeType === "grandchild") {
        nodeDiff = GRANDCHILD_RADIUS_DIFF;
    } else nodeDiff = 0

    return NORMAL_RADIUS + nodeDiff;
}

//Updates the data in the node for how much the video has been viewed
function updateViewedValue(id, amountViewedTime, duration) {
    var amountViewed = amountViewedTime / duration;
    var amountUnviewed = 1.00 - amountViewed;

    var index = findNodeIndex(id);

    //Update the dataset with new values
    dataset.nodes[index].typeData.progress[0].value = amountViewed;
    dataset.nodes[index].typeData.progress[1].value = amountUnviewed;

    if (saveProgressToCookie) {
        var progressObj = JSON.stringify(getDatasetProgress());
        Cookies.set("progress-data"+TAPESTRY_SLUG, progressObj);
    }
}

function getDatasetProgress() {

    var progressObj = {};

    for (var index in dataset.nodes) {
        var node = dataset.nodes[index];
        progressObj[node.id] = node.typeData.progress[0].value;
    }

    return progressObj;
}

function setDatasetProgress(progressObj) {

    if (progressObj.length < 1) {
        return false;
    }

    for (var id in progressObj) {

        var amountViewed = progressObj[id];
        var amountUnviewed = 1.00 - amountViewed;

        var index = findNodeIndex(id);

        if (index !== -1) {
            //Update the dataset with new values
            dataset.nodes[index].typeData.progress[0].value = amountViewed;
            dataset.nodes[index].typeData.progress[1].value = amountUnviewed;
        }

    }

    return true;
}

/* For setting the "type" field of nodes in dataset */
function setNodeTypes(rootId) {

    root = rootId;
    var children = getChildren(root),
        grandchildren = getGrandchildren(children);

    for (var i in dataset.nodes) {
        var node = dataset.nodes[i];
        var id = node.id;

        //NOTE: If there are any nodes are that fit two roles (ie: root and the grandchild),
        //      should default to being the more senior role
        if (id === root) {
            node.nodeType = "root";
        } else if (children.indexOf(id) > -1) {
            node.nodeType = "child";
        } else if (grandchildren.indexOf(id) > -1) {
            node.nodeType = "grandchild";
        } else {
            node.nodeType = "";
        }
    }
}

/* For setting the "type" field of links in dataset */
function setLinkTypes(rootId) {
    root = rootId;
    var children = getChildren(root),
        grandchildren = getGrandchildren(children);

    for (var i in dataset.links) {
        var link = dataset.links[i];
        var targetId = link.target.id;

        if (targetId === root) {
            link.type = "root";
        } else if (children.indexOf(targetId) > -1) {
            link.type = "child";
        } else if (grandchildren.indexOf(targetId) > -1) {
            link.type = "grandchild";
        } else {
            link.type = "";
        }
    }
}

})();

function closeLightbox(id, mediaType) {
    // Return to play button

    //TODO: Extract this into a helper function instead; Used idn 3 places
    var iconName;
    if (mediaType === "video") {
        iconName = "fa-play-circle";
    } else {
        iconName = "fa-exclamation-circle";
    }
    document.getElementById("mediaButtonIcon" + id).className = "fas " + iconName;
    $('#spotlight-content').css('opacity', 0);
    $('.lightbox').show().css('opacity', 0);
    setTimeout(function () {
        $('#spotlight-content').remove();
        $('#video').hide();
        //Remove the video player
        //TODO: Make interchangeable with other forms of media
        $("#mp4").remove();
    }, 1000);
}

// Wrap function specifically for SVG text
// Found on https://bl.ocks.org/mbostock/7555321
function wrapText(text, width) {
    text.each(function (d) {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            lines = [],
            currentLine = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            tspan = text.text(null)
                .append("tspan")
                .attr("class", "line" + d.id)
                .attr("x", 0)
                .attr("y", 0);

        while (word = words.pop()) {
            currentLine.push(word);
            tspan.text(currentLine.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                currentLine.pop(); // Pop the last word off of the previous line
                lines.push(currentLine);
                tspan.text(currentLine.join(" "));
                currentLine = [word]; // line now becomes a new array
                lineNumber++;
                tspan = text.append("tspan")
                    .attr("class", "line" + d.id)
                    .attr("x", 0) //0 because it keeps it in the center
                    .attr("y", function() {
                        return ++lineNumber * lineHeight + "em";
                    })
                    .text(word);
            }
        }

        var midLineIndex = Math.floor(lineNumber / 4);
        var tspans = document.getElementsByClassName("line" + d.id);
        var i = 0;
        while (tspans[i] !== undefined) {
            tspans[i].setAttribute("y", (i - midLineIndex) * lineHeight + "em");
            i++;
        }
    });
}
