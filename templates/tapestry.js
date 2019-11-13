/* jshint esversion: 6 */

function tapestryTool(config){

    this.dataset = {
        'settings': {},
        'nodes':    [],
        'links':    [],
        'groups':   [],
    };
    var tapestry = this;

    /****************************************************
     * CONSTANTS AND GLOBAL VARIABLES
     ****************************************************/

    var // declared constants
        TAPESTRY_CONTAINER_ID = config.containerId,
        PROGRESS_THICKNESS = 20,
        LINK_THICKNESS = 6,
        NORMAL_RADIUS = 140,
        ROOT_RADIUS_DIFF = 70,
        GRANDCHILD_RADIUS_DIFF = -100,
        TRANSITION_DURATION = 800,
        NODE_TEXT_RATIO = 5/6,
        COLOR_ACTIVE = "#11a6d8",
        COLOR_STROKE = "#072d42",
        COLOR_BLANK = "#8396a1",
        COLOR_BLANK_HOVER = "#cdd5d9",
        COLOR_GRANDCHILD = "#CCC",
        COLOR_LINK = "#999",
        COLOR_SECONDARY_LINK = "transparent",
        CSS_OPTIONAL_LINK = "stroke-dasharray: 30, 15;",
        TIME_BETWEEN_SAVE_PROGRESS = 5,                         // Means the number of seconds between each save progress call
        NODE_UNLOCK_TIMEFRAME = 2,                              // Time in seconds. User should be within 2 seconds of appearsAt time for unlocked nodes
        MIN_TAPESTRY_WIDTH_FACTOR = 1.5,                        // This limits how big the nodes can get when there is only a few of them
        API_PUT_METHOD = 'PUT',
        API_DELETE_METHOD = 'DELETE',
        USER_NODE_PROGRESS_URL = config.apiUrl + "/users/progress",
        USER_NODE_UNLOCKED_URL = config.apiUrl + "/users/unlocked",
        USER_NODE_SKIPPED_URL = config.apiUrl + "/users/skipped",
        TAPESTRY_H5P_SETTINGS_URL = config.apiUrl + "/users/h5psettings",
        ALLOW_SKIP_THRESHOLD = 0.95;

    var // declared variables
        root, svg, links, nodes,                                // Basics
        path, pieGenerator, arcGenerator,                       // Donut
        simulation,                                             // Force
        adjustedRadiusRatio = 1,                                // Radius adjusted for view mode
        tapestrySlug, 
        saveProgress = true, progressLastSaved = new Date(),    // Saving Progress
        enablePopupNodes = false, inViewMode = false,           // Pop-up nodes
        tapestryDimensionsBeforeDrag, nodeBeforeDrag,
        h5pVideoSettings = {},
        tapestryDepth = 4,                                      // Default depth of Tapestry
        viewLockedCheckbox = {'checked': false}, 
        tapestryDepthSlider, hideShowControls = function(){},   // Controls
        childrenOfNodeAtDepth = {},                             // This keeps a type of "cache" for storing a list 
                                                                // of children of each node at the given depth
        autoLayout = false;

    var // calculated
        MAX_RADIUS = NORMAL_RADIUS + ROOT_RADIUS_DIFF + 30,     // 30 is to count for the icon
        innerRadius = NORMAL_RADIUS * adjustedRadiusRatio - ((PROGRESS_THICKNESS * adjustedRadiusRatio) / 2),
        outerRadius = NORMAL_RADIUS * adjustedRadiusRatio + ((PROGRESS_THICKNESS * adjustedRadiusRatio) / 2),
        xORfx = autoLayout ? 'x' : 'fx',
        yORfy = autoLayout ? 'y' : 'fy';

    /****************************************************
     * EDIT-RELATED VARIABLES
     ****************************************************/

    var 
        linkToDragStarted = false, 
        nodeLinkLine,
        linkToNode, linkFromNode;

        // Create the linking line
        nodeLinkLine = document.createElementNS('http://www.w3.org/2000/svg','line');
        nodeLinkLine.setAttribute('id','tapestry-node-link-line');
        nodeLinkLine.setAttribute("stroke", COLOR_ACTIVE);
        nodeLinkLine.setAttribute("stroke-width", LINK_THICKNESS);

    /****************************************************
     * INITIALIZATION
     ****************************************************/

    /* Import data from json file, then start D3 */
    jQuery.ajaxSetup({
        beforeSend: function (xhr) {
            if (wpApiSettings && wpApiSettings.nonce) {
                xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
            }
        }
    });

    jQuery.get(config.apiUrl + "/tapestries/" + config.wpPostId, function(result){
        tapestry.dataset = result;
        if (tapestry.dataset && tapestry.dataset.nodes && tapestry.dataset.nodes.length > 0) {
            for (var i=0; i<tapestry.dataset.nodes.length; i++) {
                // change http(s):// to // in media URLs and image URLs
                if (typeof tapestry.dataset.nodes[i].typeData != "undefined" && typeof tapestry.dataset.nodes[i].typeData.mediaURL != "undefined" && tapestry.dataset.nodes[i].typeData.mediaURL.length > 0) {
                    tapestry.dataset.nodes[i].typeData.mediaURL = tapestry.dataset.nodes[i].typeData.mediaURL.replace(/(http(s?)):\/\//gi, '//');
                }
                if (typeof tapestry.dataset.nodes[i].imageURL != "undefined" && tapestry.dataset.nodes[i].imageURL.length > 0) {
                    tapestry.dataset.nodes[i].imageURL = tapestry.dataset.nodes[i].imageURL.replace(/(http(s?)):\/\//gi, '//');
                }
                // always unlock root node
                if (tapestry.dataset.nodes[i].id == tapestry.dataset.rootId) {
                    tapestry.dataset.nodes[i].unlocked = true;
                }

                // TEMPORARY BUG FIX: All nodes were getting saved as locked
                // TODO: REMOVE THIS LINE WHEN WE HAVE LOCKING FUNCTIONALITY WORKING AGAIN
                // Note: We will need to go through the existing modules wherever this is deployed
                // and save the nodes to be unlocked when this feature is deployed again
                tapestry.dataset.nodes[i].unlocked = true;
            }
        }

        tapestrySlug = tapestry.dataset.settings.tapestrySlug;
        if (tapestry.dataset.settings.autoLayout) {
            autoLayout = tapestry.dataset.settings.autoLayout;
            xORfx = autoLayout ? 'x' : 'fx';
            yORfy = autoLayout ? 'y' : 'fy';
        }

        for (var i=0; i < tapestry.dataset.nodes.length; i++) {
            if (autoLayout) {
                delete tapestry.dataset.nodes[i].fx;
                delete tapestry.dataset.nodes[i].fy;
            }
            else {
                tapestry.dataset.nodes[i].fx = tapestry.dataset.nodes[i].coordinates.x;
                tapestry.dataset.nodes[i].fy = tapestry.dataset.nodes[i].coordinates.y;
            }
        }

        tapestry.originalDataset = tapestry.dataset;
        
        root = tapestry.dataset.rootId;
        
        if (saveProgress) {

            //---------------------------------------------------
            // GET PROGRESS FROM DATABASE OR COOKIE (IF ENABLED)
            //---------------------------------------------------
            
            if (config.wpUserId) { // Get from database if user is logged in

                jQuery.get(USER_NODE_PROGRESS_URL, { "post_id": config.wpPostId }, function(retrievedUserProgress) {

                    if (retrievedUserProgress && !isEmptyObject(retrievedUserProgress)) {
                        setDatasetProgress(JSON.parse(retrievedUserProgress));
                    }

                    jQuery.get(TAPESTRY_H5P_SETTINGS_URL, { "post_id": config.wpPostId }, function(retrievedH5PSettings) {
                        if (retrievedH5PSettings && !isEmptyObject(retrievedH5PSettings)) {
                            h5pVideoSettings = JSON.parse(retrievedH5PSettings);
                        }
                    }).fail(function(e) {
                        console.error("Error with retrieving h5p video settings");
                        console.error(e);
                    }).complete(function(){
                        tapestry.init();
                    });

                }).fail(function(e) {
                    console.error("Error with retrieving node progress");
                    console.error(e);
                });
            }
            else {  // Get from cookie if user is NOT logged in
                
                var cookieProgress = Cookies.get("progress-data-"+tapestrySlug);

                if (cookieProgress) {
                    cookieProgress = JSON.parse( cookieProgress );
                    setDatasetProgress(cookieProgress);	
                }

                // Update H5P Video Settings from cookie (if any)
                var cookieH5PVideoSettings = Cookies.get("h5p-video-settings");
                if (cookieH5PVideoSettings) {
                    cookieH5PVideoSettings = JSON.parse( cookieH5PVideoSettings );
                    h5pVideoSettings = cookieH5PVideoSettings;
                }

                tapestry.init();
            }
        }
        else {
            tapestry.init();
        }
    }).fail(function(e) {
        console.error("Error with loading tapestries");
        console.error(e);
    });

    this.canCurrentUserEdit = () => Boolean(config.wpCanEditTapestry.length)

    this.init = function(isReload = false) {
        const reorderPermissions = permissions => {
            const withoutDuplicates = new Set(["public", "authenticated", ...Object.keys(permissions)])
            return [...withoutDuplicates];
        }

        this.dataset.nodes = this.dataset.nodes.map(node => {
            const updatedNode = fillEmptyFields(node, { skippable: true, behaviour: "embed", completed: false, questions: [] })
            updatedNode.permissions = fillEmptyFields(
                updatedNode.permissions, 
                { authenticated: ["read"] }
            );
            updatedNode.permissionsOrder = reorderPermissions(updatedNode.permissions);
            return updatedNode
        });

        dispatchEvent(new CustomEvent('tapestry-updated', { 
            detail: { dataset: { ...this.dataset, h5pSettings: h5pVideoSettings } }
        }));

        if (!root) {
            root = this.dataset.rootId;
        }

        //---------------------------------------------------
        // 2. SIZE AND SCALE THE TAPESTRY AND SVG TO FIT WELL
        //---------------------------------------------------
    
        updateTapestrySize();
    
        $(window).resize(function() {
            updateTapestrySize();
        });
            
        //---------------------------------------------------
        // 3. SET NODES/LINKS AND CREATE THE SVG OBJECTS
        //---------------------------------------------------

        setNodeTypes(root);
        setLinkTypes(root);
        setUnlocked();
        addDepthToNodes(root, 0, []);
        setAccessibleStatus();

        if (!isReload) {
            svg = createSvgContainer(TAPESTRY_CONTAINER_ID);
        }

        links = createLinks();
        nodes = createNodes();
    
        filterTapestry(true);
        
        //---------------------------------------------------
        // 4. UPDATE SVG DIMENSIONS AND START THE GRAPH
        //---------------------------------------------------
        
        // Ensure tapestry size fits well into the browser and start force
        updateSvgDimensions();
        setBackgroundImage();

        if (!isReload) {
            //---------------------------------------------------
            // 5. SET UP EDITING STUFF
            //---------------------------------------------------
        
            // Attach the link line to the tapestry SVG (it won't appear for now)
            $("#" + TAPESTRY_CONTAINER_ID + " > svg").prepend(nodeLinkLine);
            recordAnalyticsEvent('app', 'load', 'tapestry', tapestrySlug);
        }
    }

    this.resetNodeCache = function() {
        childrenOfNodeAtDepth = {}
    }

    /**
     * Helper function to fill in default fields of a node if
     * they do not exist.
     * @param {object} node 
     * @param {object} attributes 
     */
    function fillEmptyFields(node, attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (!node.hasOwnProperty(key)) {
                node[key] = value;
            }
        }
        return node;
    }
    
    function setBackgroundImage() {
        const { backgroundUrl } = tapestry.dataset.settings;
        const htmlBody = document.getElementsByTagName("BODY")[0];
        htmlBody.style.background = backgroundUrl ? `url(${backgroundUrl})` : "";
        htmlBody.style.backgroundSize = "cover";
    }

    this.getControls = function() {
        
        //--------------------------------------------------
        // Create wrapper div for tapestry controls
        //--------------------------------------------------
        
        var tapestryControlsDiv = document.createElement("div");
        tapestryControlsDiv.id = "tapestry-controls-wrapper"
        
        //--------------------------------------------------
        // Add in Depth Slider
        //--------------------------------------------------
        
        // Create wrapper div 
        var depthSliderWrapper = document.createElement("div");
        depthSliderWrapper.id = "tapestry-depth-slider-wrapper";
        depthSliderWrapper.style.display = "none";
        
        // Create label element
        var tapestryDepthSliderLabel = document.createElement("label");
        tapestryDepthSliderLabel.innerHTML = "Depth: ";
        depthSliderWrapper.appendChild(tapestryDepthSliderLabel);
        
        // Create input element
        tapestryDepthSlider = document.createElement("input");
        setAttributes(tapestryDepthSlider ,{
            type:"range",
            min:"2",
            max:"4",
            value:"4",
            id:"tapestry-depth-slider"
        });
        depthSliderWrapper.appendChild(tapestryDepthSlider);
        
        // Every time the slider's value is changed, do the following
        tapestryDepthSlider.onchange = function() {
            tapestryDepth = this.value;
        
            setNodeTypes(root);
            setLinkTypes(root);
        
            filterTapestry();
            updateSvgDimensions();
        };
        
        tapestryControlsDiv.appendChild(depthSliderWrapper);

        //--------------------------------------------------
        // Add in settings modal button
        //--------------------------------------------------
        var settingsButton = document.createElement("button");
        settingsButton.classList.add("settings-button");

        var settingsIcon = document.createElement("i");
        settingsIcon.classList.add("fas", "fa-cog", "settings-icon");
        settingsButton.appendChild(settingsIcon);

        settingsButton.onclick = function () {
            dispatchEvent(new CustomEvent('open-settings-modal'));
        };
        
        let showSettings = false;
        // append settings modal only if logged in
        if (config.wpCanEditTapestry) {
            tapestryControlsDiv.appendChild(settingsButton);
            showSettings = true;
        }
        
        //--------------------------------------------------
        // Checkbox to view locked nodes (logged in users only)
        //--------------------------------------------------
        
        // Create wrapper div
        var viewLockedCheckboxWrapper = document.createElement("div");
        viewLockedCheckboxWrapper.id = "tapestry-view-locked-checkbox-wrapper";
        
        // Create label element
        var viewLockedLabel = document.createElement("label");
        viewLockedLabel.innerHTML = " View locked nodes";
        setAttributes(viewLockedLabel,{
            forHtml:"tapestry-view-locked-checkbox"
        });
        
        // Create input element
        viewLockedCheckbox = document.createElement("input");
        setAttributes(viewLockedCheckbox,{
            type:"checkbox",
            value:"1",
            id: "tapestry-view-locked-checkbox"
        });
        viewLockedCheckbox.onchange = function() {
            filterTapestry();
            updateSvgDimensions();
        };

        viewLockedCheckboxWrapper.appendChild(viewLockedCheckbox);
        viewLockedCheckboxWrapper.appendChild(viewLockedLabel);
        
        if (config.wpUserId) {
            // Append the new element in its wrapper to the tapestry container
            tapestryControlsDiv.appendChild(viewLockedCheckboxWrapper);
        }

        function hideShowControls() {

            var showDepthSlider = findMaxDepth(root) >= 2;
            // Hide depth slider if depth is less than 3 
            depthSliderWrapper.style.display = showDepthSlider ? "flex" : "none";
            if (showDepthSlider) {
                settingsButton.style.marginLeft = "10px";
            }

            // Hide this if there are no locked nodes
            var lockedNodesExist = false;
            var nodes = tapestry.dataset.nodes;
            for (let i = 0; i < nodes.length; i++) {
                if (!nodes[i].unlocked) {
                    lockedNodesExist = true;
                    break;
                }
            }
            viewLockedCheckboxWrapper.style.display = lockedNodesExist ? "flex" : "none";

            tapestryControlsDiv.style.display = (lockedNodesExist || showDepthSlider || showSettings) ? "flex" : "none";
        }
        hideShowControls(); // run it now (we will also run it later when tapestry is modified)

        return tapestryControlsDiv;
    }
    
    /****************************************************
     * ADD EDITOR ELEMENTS
     ****************************************************/
    
    // To create a link
    function addLink(source, target, value, appearsAt) {
        if (target === source) {
            console.log("addLink aborting: cannot connect node to itself");
            return;
        }
    
        for (var i = 0; i < tapestry.dataset.links.length; i++) {
            // Check if link in dataset exists
            if ((tapestry.dataset.links[i].source.id === source && tapestry.dataset.links[i].target.id === target) || (tapestry.dataset.links[i].source.id === target && tapestry.dataset.links[i].target.id === source)) {
                alert("Link already exists");
                return;
            }
        }
    
        jQuery.post(config.apiUrl + "/tapestries/" + config.wpPostId + "/links", JSON.stringify({"source": source, "target": target, "value": value, "type": "", "appearsAt": appearsAt }), function() {
            tapestry.dataset.links.push({"source": source, "target": target, "value": value, "type": "", "appearsAt": appearsAt });
            tapestry.init(true);
        }).fail(function(e) {
            alert("Sorry, there was a problem adding the new link");
            console.error("Error with adding new link", e);
        });
    }
    
    function deleteLink(source, target, isDeleteNode = false, spliceIndex) {
        var newLinks = JSON.parse(JSON.stringify(tapestry.dataset.links));
        for (var i = 0; i < newLinks.length; i++) {
            if (newLinks[i].source.id === source && newLinks[i].target.id === target) {
                newLinks.splice(i, 1);
                var linkToRemove = i;
    
                 // Check if there is a path from root to source and root to target, if true then we can delete the link
                if ( isDeleteNode ||
                    (hasPathBetweenNodes(tapestry.dataset.rootId, source, newLinks) && hasPathBetweenNodes(tapestry.dataset.rootId, target, newLinks))) {
                    $.ajax({
                        url: apiUrl + "/tapestries/" + config.wpPostId + "/links/",
                        method: API_DELETE_METHOD,
                        data: JSON.stringify(linkToRemove),
                        success: function(result) {
                           tapestry.dataset.links.splice(linkToRemove, 1);
                            if (isDeleteNode) {
                                tapestry.dataset.nodes.splice(spliceIndex, 1);
                                root = tapestry.dataset.rootId; // need to change selected node b/c deleting currently selected node
                            }
                            tapestry.reinitialize();
                        },
                        error: function(e) {
                            console.error("Error removing link", e);
                        }
                    });
                } else {
                    alert("Link cannot be removed.");
                }
            }
        }
    }
    
    this.tapestryDeleteNode = function() {
        var nodeId = root;
        if (nodeId === tapestry.dataset.rootId) {
            if (tapestry.dataset.nodes && tapestry.dataset.nodes.length > 1) {
                alert("Root node can only be deleted if there are no other nodes in the tapestry.");
                return;
            }
            $.ajax({
                url: apiUrl + "/tapestries/" + config.wpPostId + "/nodes/" + nodeId,
                method: API_DELETE_METHOD,
                success: function() {
                    // removeAllNodes();
                    // tapestry.dataset.nodes.splice(0, 1);
                    // tapestry.dataset.rootId = undefined;
                    // tapestry.reinitialize();
                    location.reload();
                },
                error: function(e) {
                    console.error("Error deleting root node", e);
                }
            });
        } else if (getChildren(nodeId, 0) && getChildren(nodeId, 0).length > 1) {
            alert("Can only delete nodes with one neighbouring node.");
        } else {
            var linkToBeDeleted = -1;
            for (var i = 0; i < tapestry.dataset.links.length; i++) {
                var linkedNodeId;
                if (tapestry.dataset.links[i].source.id === nodeId) {
                    linkedNodeId = tapestry.dataset.links[i].target.id; // Node linked to the node to be deleted
                } else if (tapestry.dataset.links[i].target.id === nodeId) {
                    linkedNodeId = tapestry.dataset.links[i].source.id // Node linked to the node to be deleted
                } else {
                    continue;
                }
    
                var newLinks = JSON.parse(JSON.stringify(tapestry.dataset.links)); // deep copy
                newLinks.splice(i, 1); // remove the link and see if linkedNode is connected to root node
                if(!hasPathBetweenNodes(tapestry.dataset.rootId, linkedNodeId, newLinks)) {
                    alert("Cannot delete node.");
                    return;
                } else {
                    linkToBeDeleted = i;
                }
            }
    
             if (linkToBeDeleted !== -1) {
                for (var j = 0; j < tapestry.dataset.nodes.length; j++) {
                    if (tapestry.dataset.nodes[j].id === nodeId) {
                        var spliceIndex = j;
                        $.ajax({
                            url: apiUrl + "/tapestries/" + config.wpPostId + "/nodes/" + nodeId,
                            method: API_DELETE_METHOD,
                            success: function() {
                                deleteLink(tapestry.dataset.links[linkToBeDeleted].source.id, tapestry.dataset.links[linkToBeDeleted].target.id, true, spliceIndex);
                                location.reload();
                            },
                            error: function(e) {
                                console.error("Error deleting node " + nodeId, e);
                            }
                        });
                    }
                }
            }
        }
    }
    
     // Checks if there is a path between the start and target nodes
    function hasPathBetweenNodes(startNode, targetNode, links) {
        var visited = [];
        var queue = [];
        var neighbours = {};
    
         for (var j = 0; j < tapestry.dataset.nodes.length; j++) {
            neighbours[tapestry.dataset.nodes[j].id] = [];
        }
        for (var k = 0; k < links.length; k++) {
            neighbours[links[k].source.id].push(links[k].target.id);
            neighbours[links[k].target.id].push(links[k].source.id);
        }
        visited.push(startNode);
        queue.push(startNode);
    
         while (queue.length > 0) {
            var nodeId = queue.shift();
            for (var i = 0; i < neighbours[nodeId].length; i++) {
                if (!visited.includes(neighbours[nodeId][i])) {
                    visited.push(neighbours[nodeId][i]);
                    queue.push(neighbours[nodeId][i]);
                }
            }
        }
    
         return visited.includes(targetNode);
    }
    
    /****************************************************
     * D3 RELATED FUNCTIONS
     ****************************************************/

    /* Define forces that will determine the layout of the graph */
    function startSimulation() {

        if (autoLayout && !inViewMode) {
            d3.selectAll('g.node').each(function(d){
                delete d.fx;
                delete d.fy;
            });
        }

        var tapestryDimensions = tapestry.getTapestryDimensions();
        var nodes = tapestry.dataset.nodes;

        simulation = d3.forceSimulation(nodes)

            // "charge" and forceManyBody determine the the repulsion/attraction strength
            .force("charge", d3.forceManyBody().strength(-4000))

            // establish links, the function sets IDs as endpoints, rather than indexes
            .force("link", d3.forceLink(tapestry.dataset.links).id(function(d) {
                return d.id;
            }))

            // slow down the nodes from spinning
            .velocityDecay(0.99)

            // "center" determines where the center of gravity is
            .force("center", d3.forceCenter()
                .x(tapestryDimensions.width / 2)
                .y(tapestryDimensions.height / 2))

            // determines the minimum distance that nodes are allowed to be positioned at
            .force("collision", d3.forceCollide().radius(function (d) {
                if (root === d.id) {
                    return MAX_RADIUS;
                }
                else {
                    return (MAX_RADIUS - 25);
                }
            }));

        simulation
            .nodes(tapestry.dataset.nodes)
            .on("tick", ticked);
    }

    //Resize all nodes, where id is now the selected node
    function resizeNodes(id) {
        setNodeTypes(id);
        setLinkTypes(id);
        filterTapestry();
    }

    function ticked() {
        var tapestryDimensions = tapestry.getTapestryDimensions();
        links
            .attr("x1", function (d) {
                return getBoundedCoord(d.source.x, tapestryDimensions.width);
            })
            .attr("y1", function (d) {
                return getBoundedCoord(d.source.y, tapestryDimensions.height);
            })
            .attr("x2", function (d) {
                return getBoundedCoord(d.target.x, tapestryDimensions.width);
            })
            .attr("y2", function (d) {
                return getBoundedCoord(d.target.y, tapestryDimensions.height);
            });
        nodes
            .attr("cx", function (d) {
                return getBoundedCoord(d.x, tapestryDimensions.width);
            })
            .attr("cy", function (d) {
                return getBoundedCoord(d.y, tapestryDimensions.height);
            })
            .attr("transform", function (d) {
                return "translate(" + getBoundedCoord(d.x, tapestryDimensions.width) + "," + getBoundedCoord(d.y, tapestryDimensions.height) + ")";
            });
    }

    // D3 DRAGGING FUNCTIONS
    function dragstarted(d) {
        if(!config.wpCanEditTapestry &&
            tapestry.dataset.settings.nodeDraggable === false) {
            return;
        }
 
        if (!d3.event.active) simulation.alphaTarget(0.2).restart();

        nodeBeforeDrag = d;

        if (canEditNode(d)) {
            d[xORfx] = getBoundedCoord(d3.event.x, tapestryDimensionsBeforeDrag.width+(MAX_RADIUS*2));
            d[yORfy] = getBoundedCoord(d3.event.y, tapestryDimensionsBeforeDrag.height+(MAX_RADIUS*2));
        } else {
            d[xORfx] = getBoundedCoord(d.x, tapestryDimensionsBeforeDrag.width);
            d[yORfy] = getBoundedCoord(d.y, tapestryDimensionsBeforeDrag.height);
        }

        recordAnalyticsEvent('user', 'drag-start', 'node', d.id, {'x': d.x, 'y': d.y});
    }

    function dragged(d) {
        if(!config.wpCanEditTapestry &&
            tapestry.dataset.settings.nodeDraggable === false) {
            return;
        }

        if (canEditNode(d)) {
            d[xORfx] = getBoundedCoord(d3.event.x, tapestryDimensionsBeforeDrag.width+(MAX_RADIUS*2));
            d[yORfy] = getBoundedCoord(d3.event.y, tapestryDimensionsBeforeDrag.height+(MAX_RADIUS*2));
        } else {
            d[xORfx] = getBoundedCoord(d3.event.x, tapestryDimensionsBeforeDrag.width);
            d[yORfy] = getBoundedCoord(d3.event.y, tapestryDimensionsBeforeDrag.height);
        }
    }

    function dragended(d) {
        if(!config.wpCanEditTapestry &&
            tapestry.dataset.settings.nodeDraggable === false) {
            return;
        }

        if (!d3.event.active) simulation.alphaTarget(0);

        d[xORfx] = d.x;
        d[yORfy] = d.y;
        updateSvgDimensions();

        if (canEditNode(d) && !autoLayout) {
            $.ajax({
                url: config.apiUrl + "/tapestries/" + config.wpPostId + "/nodes/" + d.id + "/coordinates",
                method: API_PUT_METHOD,
                data: JSON.stringify({x: d.x, y: d.y}),
                error: function(e) {
                    alert("Sorry, there was an error saving the coordinates of this node!");
                    console.error(e);
                    d[xORfx] = nodeBeforeDrag.x;
                    d[yORfy] = nodeBeforeDrag.y;
                }
            });
        }

        recordAnalyticsEvent('user', 'drag-end', 'node', d.id, {'x': d.x, 'y': d.y});
    }

    function createSvgContainer() {

        // hide the container so we can smoothly fade it in at the end of this function
        $("#"+TAPESTRY_CONTAINER_ID).hide();

        // add in the controls
        document.getElementById(TAPESTRY_CONTAINER_ID).prepend(tapestry.getControls());

        // actually create the SVG
        var tapestryDimensions = tapestry.getTapestryDimensions();
        tapestryDimensionsBeforeDrag = tapestryDimensions;
        var tapestrySvg = d3.select("#"+TAPESTRY_CONTAINER_ID)
                .append("svg:svg")
                .attr("id", TAPESTRY_CONTAINER_ID+"-svg")
                .attr("viewBox", "0 0 " + tapestryDimensions.width + " " + tapestryDimensions.height)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .append("svg:g");
        
        // fade in the tapestry smoothly
        $("#"+TAPESTRY_CONTAINER_ID).fadeIn('slow');

        return tapestrySvg;
    }

    function updateSvgDimensions() {
        var tapestryDimensions = tapestry.getTapestryDimensions();
        tapestryDimensionsBeforeDrag = tapestryDimensions;

        const MIN_WIDTH = getBrowserWidth() * MIN_TAPESTRY_WIDTH_FACTOR;
        const MIN_HEIGHT = getBrowserHeight() * MIN_TAPESTRY_WIDTH_FACTOR;

        d3.select("#"+TAPESTRY_CONTAINER_ID+"-svg")
            .attr("viewBox", 
                    tapestryDimensions.startX + " " + 
                    tapestryDimensions.startY + " " + 
                    Math.max((tapestryDimensions.width - tapestryDimensions.startX), MIN_WIDTH) + " " + 
                    Math.max((tapestryDimensions.height - tapestryDimensions.startY), MIN_HEIGHT)
                );
                
        startSimulation();
    }

    function removeAllLinks() {
        if (links !== undefined) {
            svg.selectAll('line')
                .remove();
        }
    }

    function removeAllNodes() {
        if (nodes !== undefined) {
            svg.selectAll("g.node")
                .remove();
        }
    }

    function createLinks() {
        /* Need to remove old links when redrawing graph */
        removeAllLinks();

        /* Now, can draw the links */
        return svg.append("svg:g")
                    .attr("class", "links")
                    .selectAll("line")
                    .data(tapestry.dataset.links)
                        .enter()
                        .append("line")
                        .attr("stroke", function (d) {
                            return setLinkStroke(d);
                        })
                        .attr("stroke-width", LINK_THICKNESS)
                        .attr("style", function(d){
                            if (d.type === "")
                                return "display: none"
                            else if (d.optional)
                                return CSS_OPTIONAL_LINK;
                            else return "";
                        })
                        .attr("class", function(d) {
                            return "link-lines " + (canEditLink(d) ? "deletable" : "");
                        })
                        .attr("id", function(d) {
                            return "link-lines-" + d.source.id + "-" + d.target.id;
                        })
                        .on("click", function(d) {
                            if (canEditLink(d)) {
                                var confirmMsg = "Are you sure you want to delete this link? (" + tapestry.dataset.nodes[findNodeIndex(d.source.id)].title + "-" + tapestry.dataset.nodes[findNodeIndex(d.target.id)].title + ")";
                                if (confirm(confirmMsg)) {
                                    deleteLink(d.source.id, d.target.id);
                                }
                            }
                        })
                        .on("mouseover", function(d) {
                            if (canEditLink(d)) {
                                $("#link-lines-" + d.source.id + "-" + d.target.id).attr("stroke", "red");
                                $("#link-lines-" + d.source.id + "-" + d.target.id).attr("stroke-width", LINK_THICKNESS + 5);
                            }
                        })
                        .on("mouseout", function(d) {
                            if (canEditLink(d)) {
                                $("#link-lines-" + d.source.id + "-" + d.target.id).attr("stroke", function(d){
                                    return setLinkStroke(d);
                                });
                                $("#link-lines-" + d.source.id + "-" + d.target.id).attr("stroke-width", LINK_THICKNESS);
                            }
                        });
    }

    function setLinkStroke(d) {
        if (d.type === "grandchild")
            return COLOR_GRANDCHILD;
        else if (d.secondary)
            return COLOR_SECONDARY_LINK;
        else return COLOR_LINK;
    }

    function createNodes() {
        /* Need to remove old nodes when redrawing graph */
        removeAllNodes();
    
        /* Now, can draw the nodes */
        return svg.selectAll("g.node")
                    .data(tapestry.dataset.nodes)
                    .enter()
                    .append("svg:g")
                        .attr("class", "node")
                        .attr("id", function (d) {
                            return "node-" + d.id;
                        });
    }
    
    /**
     * This function re-examines the tapestry, restructures it if necessary, and hides/shows elements based on the dataset
     * @param {boolean} freshBuild If true, calls buildNodeContents() after done; otherwise calls rebuildNodeContents()
     */
    function filterTapestry(freshBuild=false) {
    
        // Show Links
    
        var linksToShow = links.filter(function (d) {
            return ( getViewable(getNodeById(d.target.id)) && getViewable(getNodeById(d.source.id)) );
        });
    
        linksToShow
            .style("display", "block")
            .transition()
            .duration(TRANSITION_DURATION)
            .style("opacity", "1");
    
        // Hide Links
    
        var linksToHide = links.filter(function (d) {
            return !( getViewable(getNodeById(d.target.id)) && getViewable(getNodeById(d.source.id)) );
        });
    
        linksToHide
            .transition()
            .duration(TRANSITION_DURATION/2)
            .style("opacity", "0");
        
        setTimeout(function(){
            linksToHide.style("display", "none");
        }, TRANSITION_DURATION/2);
    
        // Show Nodes
    
        var nodesToShow = nodes.filter(function (d) {
            return getViewable(d);
        });
    
        nodesToShow
            .style("display", "block")
            .transition()
            .duration(TRANSITION_DURATION/2)
            .style("opacity", "1");
        
        // Hide Nodes
    
        var nodesToHide = nodes.filter(function (d) {
            return !getViewable(d);
        });
    
        nodesToHide
            .transition()
            .duration(TRANSITION_DURATION)
            .style("opacity", "0");
    
        setTimeout(function(){
            nodesToHide.style("display", "none");
        }, TRANSITION_DURATION);
        
        if (freshBuild) {
            buildNodeContents();
        }
        else {
            rebuildNodeContents();
        }
    }
    
    /* Draws the components that make up node */
    function buildNodeContents() {

        tapestryDepthSlider.max = findMaxDepth(root);
        hideShowControls();

        /* Draws the circle that defines how large the node is */
        nodes.append("rect")
            .attr("class", function (d) {
                if (d.nodeType === "grandchild") return "imageContainer grandchild";
                return "imageContainer";
            })
            .attr("rx", function (d) {
                if (d.hideProgress && d.imageURL.length) {
                    return 0;
                }
                return getRadius(d);
            })
            .attr("ry", function (d) {
                if (d.hideProgress && d.imageURL.length) {
                    return 0;
                }
                return getRadius(d);
            })
            .attr("data-id", function (d) {
                return d.id;
            })
            .attr("stroke-width", function (d) {
                if (!d.hideProgress) {
                    return PROGRESS_THICKNESS * adjustedRadiusRatio;
                }
            })
            .attr("stroke", function (d) {
                if (!getViewable(d) || d.hideProgress)
                    return "transparent";
                else if (d.nodeType === "grandchild")
                    return COLOR_GRANDCHILD;
                else return COLOR_STROKE;
            })
            .attr("width", function (d) {
                if (!getViewable(d)) return 0;
                return getRadius(d) * 2;
            })
            .attr("height", function (d) {
                if (!getViewable(d)) return 0;
                return getRadius(d) * 2;
            })
            .attr("x", function (d) {
                return - getRadius(d);
            })
            .attr("y", function (d) {
                return - getRadius(d);
            })
            .attr("fill", function (d) {
                if (d.imageURL.length)
                    return "url('#node-thumb-" + d.id + "')";
                else return COLOR_BLANK_HOVER;
            });
    
        nodes.append("circle")
            .filter(function (d) {
                // no overlay if hiding progress and there is an image
                return !(d.hideProgress && d.imageURL.length);
            })
            .attr("class", function (d) {
                return getNodeClasses(d);
            })
            .attr("data-id", function (d) {
                return d.id;
            })
            .attr("stroke-width", function () {
                return PROGRESS_THICKNESS;
            })
            .attr("r", function (d) {
                var rad = getRadius(d);
                if (d.hideProgress) {
                    return rad;
                } else if (rad > PROGRESS_THICKNESS/2) {
                    return rad - PROGRESS_THICKNESS/2;
                }
                else {
                    return 0;
                }
            })
            .attr("fill", function (d) {
                return getNodeColor(d);
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
                if (!getViewable(d)) return 0;
                return getRadius(d) * 2;
            })
            .attr("width", function (d) {
                if (!getViewable(d)) return 0;
                return getRadius(d) * 2;
            })
            .attr("x", 0)
            .attr("y", 0)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .attr("xlink:href", function (d) {
                return d.imageURL;
            });

        /* Add path and button */
        buildPathAndButton();
    
        nodes.on("mouseover", function(thisNode){
            if (linkToDragStarted) {
                linkToNode = thisNode;
            }
        }).on("mouseout", function(){
            if (linkToDragStarted) {
                linkToNode = undefined;
            }
        });
    
        /* Add dragging and node selection functionality to the node */
        nodes
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            )
            .on("click keydown", function (d) {
                recordAnalyticsEvent('user', 'click', 'node', d.id);
                if (root != d.id) { // prevent multiple clicks
                    root = d.id;
                    tapestry.resetNodeCache();
                    resizeNodes(d.id);
                    addDepthToNodes(root, 0, []);

                    dispatchEvent(new CustomEvent('change-selected-node', {detail: root}));

                    // slider's maximum depth is set to the longest path from the new selected node
                    tapestryDepthSlider.max = findMaxDepth(root);
                    updateSvgDimensions();
                }
                else if (d.hideMedia) {
                    var thisBtn = $('#node-' + d.id + ' .mediaButton > i')[0];
                    dispatchEvent(
                        new CustomEvent(
                            'open-lightbox', 
                            { detail: thisBtn.dataset.id }
                        )
                    );
                    recordAnalyticsEvent('user', 'open', 'lightbox', thisBtn.dataset.id);
                }
            });
    }

    function rebuildNodeContents() {
        /* Remove text before transition animation */
        $(".meta").remove();
    
        /* Commence transition animation */
        nodes.selectAll(".imageOverlay")
                .transition()
                .duration(TRANSITION_DURATION/2)
                .attr("r", function (d) {
                    var rad = getRadius(d);
                    if (d.hideProgress) {
                        return rad;
                    } else if (rad > (PROGRESS_THICKNESS * adjustedRadiusRatio)/2) {
                        return rad - (PROGRESS_THICKNESS * adjustedRadiusRatio)/2;
                    }
                    else {
                        return 0;
                    }
                })
                .attr("class", function (d) {
                    return getNodeClasses(d);
                })
                .attr("fill", function (d) {
                    return getNodeColor(d);
                });
                
        nodes.selectAll(".imageContainer")
                .attr("class", function (d) {
                    if (!getViewable(d))
                        return "imageContainer grandchild";
                    else return "imageContainer";
                })
                .transition()
                .duration(TRANSITION_DURATION)
                .attr("rx", function (d) {
                    if (d.hideProgress && d.imageURL.length) {
                        return 0;
                    }
                    return getRadius(d);
                })
                .attr("ry", function (d) {
                    if (d.hideProgress && d.imageURL.length) {
                        return 0;
                    }
                    return getRadius(d);
                })
                .attr("stroke", function (d) {
                    if (!getViewable(d) || d.hideProgress)
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
                    if (d.imageURL.length)
                        return "url('#node-thumb-" + d.id + "')";
                    else return COLOR_BLANK_HOVER;
                })
                .attr("stroke-width", function (d) {
                    if (!d.hideProgress) {
                        return PROGRESS_THICKNESS * adjustedRadiusRatio;
                    }
                });
        
        /* Attach images to be used within each node */
        nodes.selectAll("defs")
                .selectAll("pattern")
                .selectAll("image")
                .transition()
                .duration(TRANSITION_DURATION)
                .attr("height", function (d) {
                    if (!getViewable(d)) return 0;
                    return getRadius(d) * 2;
                }) 
                .attr("width", function (d) {
                    if (!getViewable(d)) return 0;
                    return getRadius(d) * 2;
                });
    
        // Remove elements and add them back in
        nodes.selectAll(".mediaButton").remove();
        nodes.selectAll(".editNodeButton").remove();
        nodes.selectAll(".addNodeButton").remove();
        nodes.selectAll(".metaWrapper").remove();
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
    
    /* Create the node meta */
        nodes
            .filter(function (d){
                return getViewable(d) && !d.hideTitle;
            })
            .append('foreignObject')
            .attr("class","metaWrapper")
            .attr("width", NORMAL_RADIUS * 2 * NODE_TEXT_RATIO)
            .attr("height", NORMAL_RADIUS * 2 * NODE_TEXT_RATIO)
            .attr("style", function (d) {
                return d.nodeType === "grandchild" ? "visibility: hidden" : "visibility: visible";
            })
            .attr("data-id", function (d) {
                return d.id;
            })
            .attr("x", -NORMAL_RADIUS * NODE_TEXT_RATIO)
            .attr("y", -NORMAL_RADIUS * NODE_TEXT_RATIO)
            .append("xhtml:div")
                .attr("class","meta")
                .html(function(d){
                var base = "<p class='title'>" + d.title + "</p>";
                if (d.mediaType === 'video') {
                    if (d.mediaDuration) {
                        base += "\n<p class='timecode'>" + getVideoDuration(d.mediaDuration) + "</p>";
                    }
                }
                return base;
                });
            
        updateViewedProgress();
    
        // Append mediaButton
        nodes
            .filter(function (d) {
                return getViewable(d);
            })
            .append("svg:foreignObject")
            .html(function (d) {
                return '<i id="mediaButtonIcon' + d.id + '"' + 
                    ' class="' + getIconClass(d.mediaType, 'play') + ' mediaButtonIcon"' +
                    ' data-id="' + d.id + '"' + 
                    ' data-format="' + d.mediaFormat + '"' + 
                    ' data-media-type="' + d.mediaType + '"' + 
                    ' data-thumb="' + d.imageURL + '"' + 
                    ' data-url="' + (d.typeData.mediaURL ? d.typeData.mediaURL : '') + '"' +
                    ' data-media-width="' + d.typeData.mediaWidth + '"' + 
                    ' data-media-height="' + d.typeData.mediaHeight + '"><\/i>';
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
                return -NORMAL_RADIUS * adjustedRadiusRatio - 30 - (d.nodeType === "root" ? ROOT_RADIUS_DIFF : 0);
            })
            .attr("style", function (d) {
                return (d.nodeType === "grandchild" || d.hideMedia) ? "visibility: hidden" : "visibility: visible";
            })
            .attr("class", "mediaButton");
    
        $('.mediaButton > i').click(function(){
            var thisBtn = $(this)[0];
            dispatchEvent(
                new CustomEvent(
                    'open-lightbox', 
                    { detail: thisBtn.dataset.id }
                )
            );
            recordAnalyticsEvent('user', 'open', 'lightbox', thisBtn.dataset.id);
        });
    
        // Append addNodeButton
        nodes
            .filter(function (d) {
                return checkPermission(d, "add");
            })
            .append("svg:foreignObject")
            .html(function (d) {
                return '<i  title="Click to add node or drag to another node to link" id="addNodeIcon' + d.id + '"' +
                    ' class="' + getIconClass("add") + ' mediaButtonIcon"' +
                    ' data-id="' + d.id + '"><\/i>';
            })
            .attr("id", function (d) {
                return "addNodeIcon" + d.id;
            })
            .attr("data-id", function (d) {
                return d.id;
            })
            .attr("width", "60px")
            .attr("height", "62px")
            .attr("x", -50)
            .attr("y", function (d) {
                return NORMAL_RADIUS + ROOT_RADIUS_DIFF - 30;
            })
            .attr("style", function (d) {
                return d.nodeType === "grandchild" || d.nodeType === "child" ? "visibility: hidden" : "visibility: visible";
            })
            .attr("class", "mediaButton addNodeButton")
            .call(d3.drag()
                .on('start',function(thisNode){
                    linkFromNode = thisNode;
                })
                .on('drag',function(){  
                    linkToDragStarted = true;
                    nodeLinkLine.setAttribute('x1',linkFromNode.x);
                    nodeLinkLine.setAttribute('y1',linkFromNode.y + MAX_RADIUS - 10);
                    nodeLinkLine.setAttribute('x2',d3.event.x);
                    nodeLinkLine.setAttribute('y2',d3.event.y + MAX_RADIUS - 10);
                })
                .on('end',function(){
                    if (typeof linkToNode != "undefined" && linkFromNode.id != linkToNode.id) {
                        if (confirm('Link from ' + linkFromNode.title + ' to ' + linkToNode.title + "?")) {
                            addLink(linkFromNode.id, linkToNode.id, 1, '');
                        }
                    }
                    // Reset everything
                    linkToDragStarted = false;
                    linkFromNode = undefined;
                    linkToNode = undefined;
                    nodeLinkLine.removeAttribute('x1');
                    nodeLinkLine.removeAttribute('y1');
                    nodeLinkLine.removeAttribute('x2');
                    nodeLinkLine.removeAttribute('y2');
                })
            );
    
        $('.addNodeButton').click(function(){
            dispatchEvent(new CustomEvent("add-new-node"))
        });
    
        // Append editNodeButton
        nodes
            .filter(function (d) {
                return d.nodeType !== "" && checkPermission(d, "edit");
            })
            .append("svg:foreignObject")
            .html(function (d) {
                return '<i id="editNodeIcon' + d.id + '"' +
                    ' class=" fas fa-pen' + ' mediaButtonIcon"' +
                    ' data-id="' + d.id + '"><\/i>';
            })
            .attr("id", function (d) {
                return "editNodeIcon" + d.id;
            })
            .attr("data-id", function (d) {
                return d.id;
            })
            .attr("width", "60px")
            .attr("height", "62px")
            .attr("x", 10)
            .attr("y", function (d) {
                return NORMAL_RADIUS + ROOT_RADIUS_DIFF - 30;
            })
            .attr("style", function (d) {
                return d.nodeType === "grandchild" || d.nodeType === "child" ? "visibility: hidden" : "visibility: visible";
            })
            .attr("class", "mediaButton editNodeButton");
    
        $('.editNodeButton').click(function(){
            dispatchEvent(new CustomEvent("edit-node"))
        });
    }

    function getVideoDuration(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        var sec = seconds - (hours * 3600) - (minutes * 60);

        if (sec < 10)
            sec = "0" + sec;

        if (hours > 0 && minutes < 10)
            minutes = "0" + minutes;
        
        if (hours === 0)
            return minutes + ":" + sec;

        return hours + ":" + minutes + ":" + sec;
    }

    function updateViewedProgress() {
        path = nodes
            .selectAll("path")
            .data(function (d, i) {
                var data = d.typeData.progress;
                data.forEach(function (e) {
                    e.extra = {'nodeType': d.nodeType, 'unlocked': d.unlocked };
                })
                return pieGenerator(data, i);
            });
    
        path.transition().duration(750).attrTween("d", arcTween);
    
        path.enter()
            .append("path")
            .attr("fill", "transparent")
            .attr("class", function (d) {
                if (d.data.extra.nodeType === "grandchild")
                    return "grandchild";
            })
            .attr("d", function (d) {
                return arcGenerator(adjustProgressBarRadii(d));
            });
    }
    
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
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
            addedRadiusInner = -1 * (innerRadius + addedRadius); // set inner radius to 0
        }
        arcGenerator.innerRadius(innerRadius * adjustedRadiusRatio + addedRadius + addedRadiusInner)(d);
        arcGenerator.outerRadius(outerRadius * adjustedRadiusRatio + addedRadius)(d);
        return d;
    }
    
    /****************************************************
     * MEDIA RELATED FUNCTIONS
     ****************************************************/

    // unlocks children based on video progress
    this.updateChildren = function(id, video) {
        const childrenData = getChildrenData(id)
        for (var i = 0; i < childrenData.length; i++) {
            if (Math.abs(childrenData[i].appearsAt - video.currentTime) <= NODE_UNLOCK_TIMEFRAME && video.paused === false && !tapestry.dataset.nodes[childrenData[i].nodeIndex].unlocked) {
                saveNodeAsUnlocked(childrenData[i]);
                setAccessibleStatus();
                filterTapestry();
            }
        }
    }

    this.updateProgressBars = updateViewedProgress;

    this.recordAnalyticsEvent = recordAnalyticsEvent;
    
    this.exitViewMode = exitViewMode;
    // Builds the view mode, including functionality to
    this.changeToViewMode = function changeToViewMode(lightboxDimensions) {
    
        if (!enablePopupNodes) {
            return;
        }

        inViewMode = true;
        tapestry.originalDataset = tapestry.dataset;
        var children = getChildren(root);
        setViewModeRadiusRatio(lightboxDimensions.adjustedOn, children.length);
        var coordinates = getViewModeCoordinates(lightboxDimensions, children);
        
        var tapestryDimensions = tapestry.getTapestryDimensions();
    
        // Add the coordinates to the nodes
        d3.selectAll('g.node').each(function(d) {
            d.fixed = true;
            if (d.nodeType === "root") {
                d.fx = tapestryDimensions.width / 2;
                if (lightboxDimensions.adjustedOn === "width") {
                    d.fy = tapestryDimensions.height / 2;
                } else {
                    d.fy = screenToSVG(0, $("#header").height() + NORMAL_RADIUS + ($("#spotlight-content").height() / 2)).y;
                }
            } else if (d.nodeType === "child") {
                d.fx = coordinates[d.id].fx;
                d.fy = coordinates[d.id].fy;
            }
        });
    
        filterTapestry();
    
        startSimulation();
    }
    
    function getViewModeCoordinates(lightboxDimensions, children) {
        // For determining how much space the node to be placed
        var nodeRadius = NORMAL_RADIUS * adjustedRadiusRatio * 0.8;
        var nodeSpace = (nodeRadius * 2);

        var tapestryDimensions = tapestry.getTapestryDimensions();
    
        var coordinates = [];
        for (var i = 0; i < children.length; i++) {
            if (children.length <= 2) {
                if (lightboxDimensions.adjustedOn === "width") {
                    if (i % 2 === 0) {
                        coordinates[children[i]] = {
                            "fx": 0,
                            "fy": tapestryDimensions.height / 2
                        };
                    } else {
                        coordinates[children[i]] = {
                            "fx": screenToSVG(getBrowserWidth(), 0).x - nodeSpace,
                            "fy": tapestryDimensions.height / 2
                        };
                    }
                } else {
                    if (i % 2 === 0) {
                        coordinates[children[i]] = {
                            "fx": tapestryDimensions.width / 2,
                            "fy": 0
                        };
                    } else {
                        coordinates[children[i]] = {
                            "fx": tapestryDimensions.width / 2,
                            "fy": tapestryDimensions.height - nodeSpace
                        };
                    }
                }
            } else {
                if (lightboxDimensions.adjustedOn === "width") {
                    if (i % 2 === 0) {
                        coordinates[children[i]] = {
                            "fx": 0,
                            "fy": Math.min(screenToSVG(0, getBrowserHeight() * (i / (children.length - 1))).y + nodeRadius, tapestryDimensions.height - nodeSpace)
                        };
                    } else {
                        coordinates[children[i]] = {
                            "fx": screenToSVG(getBrowserWidth(), 0).x - nodeSpace,
                            "fy": Math.min(screenToSVG(0, getBrowserHeight() * ((i-1) / (children.length - 1))).y + nodeRadius, tapestryDimensions.height - nodeSpace)
                        };
                    }
                } else {
                    if (i % 2 === 0) {
                        coordinates[children[i]] = {
                            "fx": Math.min(tapestryDimensions.width * (i / (children.length - 1)) + nodeRadius, tapestryDimensions.width - (nodeSpace * 2)),
                            "fy": 0
                        };
                    } else {
                        coordinates[children[i]] = {
                            "fx": Math.min(tapestryDimensions.width * ((i - 1) / (children.length - 1)) + nodeRadius, tapestryDimensions.width - (nodeSpace * 2)),
                            "fy": screenToSVG(0, (NORMAL_RADIUS * 1.5) + (NORMAL_RADIUS * 0.1) + $("#spotlight-content").height() + $(".mediaButtonIcon").height()).y
                        };
                    }
                }
            }
        }
        return coordinates;
    }
    
    // For calculating adjustment ratio for adjusting the size of NORMAL_RADIUS for the child nodes while in view mode
    // Returns 1 if not in view mode
    function setViewModeRadiusRatio(adjustedOn, numChildren) {
        if (inViewMode) {

            if (adjustedOn === "width") {
                adjustedRadiusRatio = (getBrowserHeight() / (Math.ceil(numChildren / 2) * NORMAL_RADIUS * 2 * 1.2)).toPrecision(4);
            } else {
                adjustedRadiusRatio = (getBrowserWidth() / (Math.ceil(numChildren / 2) * NORMAL_RADIUS)).toPrecision(4);
            }

            if (adjustedRadiusRatio > 1) adjustedRadiusRatio = 1;

        } else {
            adjustedRadiusRatio = 1;
        }
    }
    
    function exitViewMode() {
    
        if (!enablePopupNodes) {
            return;
        }
    
        // For reapplying the coordinates of all the nodes prior to transitioning to play-mode
        if (!autoLayout) {  

            for (var i in tapestry.dataset.nodes) {
                tapestry.dataset.nodes[i].fx = tapestry.originalDataset.nodes[i].fx;
                tapestry.dataset.nodes[i].fy = tapestry.originalDataset.nodes[i].fy;
            }
                
            d3.selectAll('g.node')
                .transition()
                .duration(TRANSITION_DURATION)
                .attr("cx", function(d) { return d.fx; })
                .attr("cy", function(d) { return d.fy; });
        }

    d3.selectAll('g.node')
        .transition()
        .duration(TRANSITION_DURATION);
            
        inViewMode = false;
    
        filterTapestry();
        updateTapestrySize();
        if (adjustedRadiusRatio < 1) {
            setViewModeRadiusRatio(null, null);  //Values set to null because we don't really care; Function should just return 1
        }
        startSimulation();
    }
    
    /****************************************************
     * HELPER FUNCTIONS
     ****************************************************/
    
    // Set multiple attributes for an HTML element at once
    function setAttributes(elem, obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                elem[prop] = obj[prop];
            }
        }
    }

    // Get width, height, and aspect ratio of viewable region
    function getBrowserWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    function getBrowserHeight() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
    function getAspectRatio() {
        var browserHeight = getBrowserHeight();
        var browserWidth = getBrowserWidth();
        if (browserHeight < 10 ) {
            return 0;
        }
        else {
            return browserWidth / browserHeight;
        }
    }

    // return the highest x and y that a node is placed at
    function getNodesDimensions(dataset) {

        var maxPointX = 0;
        var maxPointY = 0;
        var minPointX = 3000;
        var minPointY = 3000;
                    
        if (autoLayout) {
            var maxDepth = findMaxDepth(root);
            minPointX = 0;
            minPointY = 0;
            maxPointX = Math.pow(dataset.nodes.length, 1/maxDepth) * MAX_RADIUS * maxDepth * getAspectRatio();
            maxPointY = Math.pow(dataset.nodes.length, 1/maxDepth) * MAX_RADIUS * maxDepth;
        }
        else {
            for (var index in dataset.nodes) {
                if (getViewable(dataset.nodes[index])) {

                    // save max point so we can calculate our tapestry width and height
                    if (dataset.nodes[index].fx > maxPointX) {
                        maxPointX = tapestry.dataset.nodes[index].fx;
                    }
                    if (dataset.nodes[index].fy > maxPointY) {
                        maxPointY = tapestry.dataset.nodes[index].fy;
                    }

                    if (dataset.nodes[index].fx < minPointX) {
                        minPointX = dataset.nodes[index].fx;
                    }
                    if (dataset.nodes[index].fy < minPointY) {
                        minPointY = dataset.nodes[index].fy;
                    }
                }
            }
        }

        return {
            'x0': minPointX,
            'y0': minPointY,
            'x': maxPointX,
            'y': maxPointY
        };
    }

    /* Gets the boundary of the tapestry */
    this.getTapestryDimensions = function () {

        var tapestryWidth = $('#'+TAPESTRY_CONTAINER_ID).outerWidth();
        var tapestryHeight = getBrowserHeight() - $('#'+TAPESTRY_CONTAINER_ID).offset().top;
        var tapestryStartX = 0;
        var tapestryStartY = 0;

        var nodeDimensions = getNodesDimensions(tapestry.originalDataset);

        if (nodeDimensions.x > tapestryWidth || nodeDimensions.y > tapestryHeight) {
            tapestryStartX = nodeDimensions.x0 - MAX_RADIUS*1.25;
            tapestryStartY = nodeDimensions.y0 - MAX_RADIUS*1.25;
            tapestryWidth = nodeDimensions.x;
            tapestryHeight = nodeDimensions.y;
        }

        var windowWidth = getBrowserWidth();
        // Center the nodes if there is not enough of them to fill the width of the screen
        if ( (tapestryWidth - tapestryStartX - MAX_RADIUS*1.25) < windowWidth) {
            tapestryStartX -= (windowWidth - tapestryWidth + tapestryStartX) / 2 + MAX_RADIUS;
        }

        // Transpose the tapestry so it's longest side is aligned with the longest side of the browser
        // For example, vertically long tapestries should be transposed so they are horizontally long on desktop,
        // but kept the same way on mobile phones where the browser is vertically longer
        // Note: Disabled for authors because it doesn't allow the author to lay out the tapestry the way
        // they want to while drafting a tapestry if we keep transposing it
        if (!config.wpCanEditTapestry) {
            var tapestryAspectRatio = nodeDimensions.x / nodeDimensions.y;
            var windowAspectRatio = getAspectRatio();
            if (tapestryAspectRatio > 1 && windowAspectRatio < 1 || tapestryAspectRatio < 1 && windowAspectRatio > 1) {
                transposeNodes();
            }
        }

        return {
            'width': tapestryWidth + MAX_RADIUS*1.25,
            'height': tapestryHeight + MAX_RADIUS*1.25,
            'startX': autoLayout ? 0 : tapestryStartX,
            'startY': autoLayout ? 0 : tapestryStartY,
        };
    }

    /* Updates the size of the overall tapestry
    (ie: the area that encompasses the boundaries of the nodes)
        according to where the nodes are placed in the dataset */
    function updateTapestrySize() {
        if (!inViewMode) {
            // Update svg dimensions to the new dimensions of the browser
        updateSvgDimensions();
        }
        startSimulation();
    }

    /* Changes the node depending on horizontal/vertical view */
    function transposeNodes() {
        for (var index in tapestry.dataset.nodes) {
            var temp_fx = tapestry.dataset.nodes[index].fy;
            tapestry.dataset.nodes[index].fy = tapestry.dataset.nodes[index].fx;
            tapestry.dataset.nodes[index].fx = temp_fx;
        }
    }

    /* Finds the node index with node ID */
    function findNodeIndex(id) {
        function helper(obj) {
            return obj.id == id;
        }

        return tapestry.dataset.nodes.findIndex(helper);
    }

    /* Gets a node in the dataset by ID */
    function getNodeById(id) {
        return tapestry.dataset.nodes.find(node => node.id === id);
    }

    /* Gets the appropriate class names for the node */
    function getNodeClasses(node) {
        var base = "imageOverlay";
        if (node.nodeType === "grandchild") {
            base += " grandchild";
        }
        if (node.imageURL.length === 0) {
            base += " imageOverlay--no-image";
        }
        return base;
    }

    function getNodeColor(node) {
        if (!getViewable(node))
            return "transparent";
        if (node.nodeType === "grandchild")
            return COLOR_GRANDCHILD;
        if (node.imageURL.length === 0)
            return COLOR_BLANK;
        return COLOR_STROKE;
    }

    function getBoundedCoord(coord, maxCoord) {
    
        return Math.max(MAX_RADIUS, Math.min(maxCoord - MAX_RADIUS, coord));
    }

    /* Add 'depth' parameter to each node recursively. 
        The depth is determined by the number of levels from the root each node is. */
    function addDepthToNodes(id, depth, visited) {
        visited.push(id);

        const node = tapestry.dataset.nodes[findNodeIndex(id)];
        if (node) {
            node.depth = depth;
        }

        const children = getChildren(id, 0);
        children.forEach(child => {
            if (visited.includes(child)) {
                const childNode = tapestry.dataset.nodes[findNodeIndex(child)];
                childNode.depth = Math.min(childNode.depth, depth);
            } else {
                addDepthToNodes(child, depth + 1, visited);
            }
        })
    }
    
    /* Return the distance between a node and its farthest descendant node */
    function findMaxDepth(id) {
    
        if ((tapestry.dataset && tapestry.dataset.nodes.length === 0) || !id || (findNodeIndex(id) === -1))  {
            return 0;
        }
    
        var nodes = tapestry.dataset.nodes;
    
        // idList: collect node IDs since they're numbered dynamically
        var idList = [];
        for (var count = 0; count < nodes.length; count++) {
            idList = idList.concat(nodes[count].id);
        }
    
        // cycle through the idList and find the greatest depth. that's the maxDepth
        var maxDepth = 0;
        idList.forEach(function(id) {
            if (tapestry.dataset.nodes[findNodeIndex(id)].depth > maxDepth) {
                    maxDepth = tapestry.dataset.nodes[findNodeIndex(id)].depth;
                }
        });
    
        return maxDepth;
    }

    /* Find children based on depth.
        depth = 0 returns node + children, depth = 1 returns node + children + children's children, etc. */
    function getChildren(id, depth = tapestryDepth, visited = []) {
        if (depth < 0) {
            return [];
        }

        if (visited.includes(id)) {
            return [];
        }

        const key = id + '-' + depth;
        
        if (childrenOfNodeAtDepth[key] !== undefined) {
            return childrenOfNodeAtDepth[key];
        }

        visited.push(id);

        let children = [];
        const links = tapestry.dataset.links.filter(
            link => link.source.id === id || link.target.id === id
        );

        for (let link of links) {
            const child = link.source.id === id ? link.target.id : link.source.id;
            if (!visited.includes(child)) {
                children.push(child);
                children = [
                    ...children,
                    ...getChildren(child, depth - 1, visited),
                ];
            }
        }

        childrenOfNodeAtDepth[key] = children;
        return children;
    }
    
    /* Gets the size of the node depending on the type of the node relevant to the currently selected node */
    function getRadius(d) {
        var radius;
        if (d.nodeType === "") {
            return 0;
        } else if (d.nodeType === "root") {
            radius = NORMAL_RADIUS * adjustedRadiusRatio + ROOT_RADIUS_DIFF;
        } else if (d.nodeType === "grandchild") {
            radius = NORMAL_RADIUS + GRANDCHILD_RADIUS_DIFF;
        } else {
            radius = NORMAL_RADIUS * adjustedRadiusRatio;
        }
        return radius;
    }
    
    function setDatasetProgress(progressObj) {
        
        if (progressObj.length < 1) {
            return false;
        }
        
        for (var id in progressObj) {
            var amountViewed = progressObj[id].progress;
            var amountUnviewed = 1.00 - amountViewed;
            var unlocked = progressObj[id].unlocked;
            const quizCompletionInfo = progressObj[id].quiz;
        
            var index = findNodeIndex(id);
            
            if (index !== -1) {
                //Update the dataset with new values
                tapestry.dataset.nodes[index].typeData.progress[0].value = amountViewed;
                tapestry.dataset.nodes[index].typeData.progress[1].value = amountUnviewed;
                tapestry.dataset.nodes[index].unlocked = unlocked ? true : false;

                const questions = tapestry.dataset.nodes[index].quiz;
                Object.entries(quizCompletionInfo).forEach(([questionId, isCompleted]) => {
                    const question = questions.find(question => question.id === questionId);
                    question.completed = isCompleted;
                })
            }
        }
    
        if (tapestry.dataset && tapestry.dataset.nodes && tapestry.dataset.nodes.length > 0) {
            for (var i=0; i<tapestry.dataset.nodes.length; i++) {
                if (tapestry.dataset.nodes[i].id == tapestry.dataset.rootId) {
                    tapestry.dataset.nodes[i].unlocked = true;
                    break;
                }
            }
        }
    
        dispatchEvent(new CustomEvent("tapestry-updated", {
            detail: { dataset: tapestry.dataset }
        }))
        return true;
    }
    
    /* For saving the "unlocked" status of the given node as true for the current user */
    function saveNodeAsUnlocked(node) {
        tapestry.dataset.nodes[node.nodeIndex].unlocked = true;
        jQuery.post(USER_NODE_UNLOCKED_URL, {
            "post_id": config.wpPostId,
            "node_id": node.id,
            "unlocked": true,
        })
        .fail(function(e) {
            console.error("Error with update user's node unlock property for node index", node.nodeIndex);
            console.error(e);
        });
    }

    function saveNodeAsSkippable(node) {
        tapestry.dataset.nodes[node.index].skippable = true;
        jQuery.post(USER_NODE_SKIPPED_URL, {
            "post_id": config.wpPostId,
            "node_id": node.id,
            "skippable": true,
        })
        .fail(function (e) {
            console.error("Error with update user's node skippable property for node index", node.nodeIndex);
            console.error(e);
        });
    }
    
    /* For setting the "type" field of nodes in dataset */
    function setNodeTypes(rootId) {
    
        root = rootId;
        var children = getChildren(root, tapestryDepth - 2),
            grandchildren = getChildren(root, tapestryDepth - 1);
    
        for (var i in tapestry.dataset.nodes) {
            var node = tapestry.dataset.nodes[i];
            var id = node.id;
    
            //NOTE: If there are any nodes are that fit two roles (ie: selected and the grandchild),
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
        var children = getChildren(root, tapestryDepth - 2),
            grandchildren = getChildren(root, tapestryDepth - 1);
    
        for (var i in tapestry.dataset.links) {
            var link = tapestry.dataset.links[i];
            var targetId = link.target.id;
    
            // If unlocked, set proper link type. Else, set it as "" to present that it shouldn't be shown
            var parentIndex = findNodeIndex(tapestry.dataset.links[i].source.id);
            if (tapestry.dataset.links[i].appearsAt && tapestry.dataset.links[i].appearsAt <= (tapestry.dataset.nodes[parentIndex].typeData.progress[0].value * tapestry.dataset.nodes[parentIndex].mediaDuration)) {
                if (targetId === root) {
                    link.type = "root";
                } else if (children.indexOf(targetId) > -1) {
                    link.type = "child";
                } else if (grandchildren.indexOf(targetId) > -1) {
                    link.type = "grandchild";
                } else {
                    link.type = "";
                }
            } else {
                link.type = "";
            }
        }
    }
    
    /* For setting the "unlocked" field of nodes in dataset if logic shows node to be unlocked */
    function setUnlocked() {
        // this is here because the other unlock fix wasn't working for some reason.
        tapestry.dataset.nodes.forEach(node => {
            node.unlocked = true
        });
        /* var parentIndex;
        for (var i = 0; i < tapestry.dataset.links.length; i++) {
            
            childIndex = findNodeIndex(tapestry.dataset.links[i].target.id);
            parentIndex = findNodeIndex(tapestry.dataset.links[i].source.id);
    
            if (tapestry.dataset.links[i].appearsAt <= (tapestry.dataset.nodes[parentIndex].typeData.progress[0].value * tapestry.dataset.nodes[parentIndex].mediaDuration)) {
                tapestry.dataset.nodes[childIndex].unlocked = true;
            }
        } */
    }
    
    /**
     * Recursively sets the accessible status of the given node and its children up to the given depth
     * @param {object} node 
     * @param {integer} depth 
     */
    function setAccessibleStatus(node, depth, parentNodeId, parentIsAccessible = true){
        if (tapestry.dataset.nodes.length == 0) {
            return;
        }
    
        // If no node passed in, assume root node
        if (typeof node == "undefined") {
            node = getNodeById(root);
        }
    
        // If no node passed in, use max depth
        if (typeof depth == "undefined") {
            depth = findMaxDepth(node.id);
        }

        tapestry.dataset.nodes[findNodeIndex(node.id)].accessible = node.unlocked && parentIsAccessible;
    
        getChildren(node.id, 0).forEach (childNodeId => {
            var thisNode = getNodeById(childNodeId);
    
            // Do not traverse up the parent
            if (parentNodeId != thisNode.id) {
                // A node is accessible only if it's unlocked and its parent is accessible
                var isAccessible = thisNode.unlocked && parentIsAccessible;
                tapestry.dataset.nodes[findNodeIndex(thisNode.id)].accessible = isAccessible;
                if (depth > 0) {
                    // Keep going deeper in
                    setAccessibleStatus(thisNode, depth-1, node.id, isAccessible);
                }
            }
        });
    }
    
    // ALL the checks for whether a certain node is viewable
    function getViewable(node) {
    
        // TODO: CHECK 1: If user is authorized to view it
    
        // CHECK 2: Always show root node
        if (node.nodeType === "root" || (node.id == tapestry.dataset.rootId && node.nodeType !== "")) return true;
    
        // CHECK 3: If the user has unlocked the node
        if (!node.accessible && !viewLockedCheckbox.checked) return false;
    
        // CHECK 4: If the node is currently in view (ie: root/child/grandchild)
        if (node.nodeType === "") return false;
    
        // CHECK 5: If we are currently in view mode & if the node will be viewable in that case
        if (node.nodeType === "grandchild" && inViewMode) return false;
    
        // If it passes all the checks, return true!
        return true;
    }
    
    function checkPermission(node, permissionType) {
        if (config.wpCanEditTapestry) {
            return true;
        }
        if (node.author == config.wpUserId) {
            return true;
        }

        if (node.nodeType !== "root") {
            return false;
        }
        if (node.permissions.public && node.permissions.public.includes(permissionType)) {
            return true;
        }
    
        if (config.wpUserId && config.wpUserId !== "") {
            if (node.permissions.authenticated && node.permissions.authenticated.includes(permissionType)) {
                return true;
            }

            var userIndex = "user-" + config.wpUserId;
            if (node.permissions[userIndex] && node.permissions[userIndex].includes(permissionType)) {
                return true;
            }
        }
    
        // // TODO Check user's group id
    
        return false;
    }

    function canEditNode(d) {
        return config.wpCanEditTapestry || checkPermission(d, "edit");
    }

    function canEditLink(d) {
        return config.wpCanEditTapestry || (checkPermission(d.source, "edit") && checkPermission(d.target, "edit"));
    }
    
    // Get data from child needed for knowing whether it is unlocked or not
    function getChildrenData(parentId) {
        var childrenData = [];
        for (var i = 0; i < tapestry.dataset.links.length; i++) {
            var source = typeof tapestry.dataset.links[i].source === 'object' ? tapestry.dataset.links[i].source.id : tapestry.dataset.links[i].source;
            if (source == parentId) {
                childrenData.push({
                    "id": tapestry.dataset.links[i].target.id,
                    "nodeIndex": findNodeIndex(tapestry.dataset.links[i].target.id),
                    "appearsAt": tapestry.dataset.links[i].appearsAt
                });
            }
        }
    
        return childrenData;
    }
    
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
    var classStr = '';

    if (action == 'loading') {
        return 'mediaButtonLoading';
    }

    switch (mediaType) {

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
            classStr = classStrStart + 'play fa-text';
            break;

        case "url-embed":
            classStr = classStrStart + 'window-maximize';
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
    jQuery.post(analyticsAJAXUrl, data, function(response) {
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