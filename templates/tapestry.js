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
        COLOR_LOCKED = "#8a8a8c",
        COLOR_SECONDARY_LINK = "transparent",
        CSS_OPTIONAL_LINK = "stroke-dasharray: 30, 15;",
        MIN_TAPESTRY_WIDTH_FACTOR = 1.5,                        // This limits how big the nodes can get when there is only a few of them
        API_PUT_METHOD = 'PUT',
        API_DELETE_METHOD = 'DELETE',
        USER_NODE_PROGRESS_URL = config.apiUrl + "/users/progress",
        TAPESTRY_H5P_SETTINGS_URL = config.apiUrl + "/users/h5psettings";

    var // declared variables
        root, svg, links, nodes,                                // Basics
        path, pieGenerator, arcGenerator,                       // Donut
        simulation,                                             // Force
        tapestrySlug, 
        saveProgress = true,                                    // Saving Progress
        nodesBeforeDrag,
        tapestryDepth = 3,                                      // Default depth of Tapestry - set to 0 to disable depth change (show all)
        tapestryDepthSlider,                                    // Keeps track of the depth slider HTML
        childrenOfNodeAtDepth = {},                             // This keeps a type of "cache" for storing a list 
                                                                // of children of each node at the given depth
        autoLayout = false,
        selection = null,                                       // a set containing the currently selected nodes
        isMultiSelect = false,                                  // a flag determining whether the cmd, shift, or ctrl keys are pressed
        movementsEnabled = true,                                // enables/disables node movements by author or d3 itself
        renderImagesForEditors = true,                      // when authoring large tapestries, set this to false to improve performance
        hardCodedDimensions = false,                            // if a tapestry has been finalized, adding this will improve performance
                                                                // (console log getTapestryDimensions() with max depth to get this value)
        visibleNodes = new Set();                               // set of ids containing all the visible nodes 

    var // calculated
        MAX_RADIUS = NORMAL_RADIUS + ROOT_RADIUS_DIFF + 30,     // 30 is to count for the icon
        innerRadius = NORMAL_RADIUS - (PROGRESS_THICKNESS / 2),
        outerRadius = NORMAL_RADIUS + (PROGRESS_THICKNESS / 2),
        xORfx = autoLayout ? 'x' : 'fx',
        yORfy = autoLayout ? 'y' : 'fy',
        renderImages = config.wpCanEditTapestry ? renderImagesForEditors : true;

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

    const conditionTypes = {
        NODE_COMPLETED: "node_completed",
        DATE_NOT_PASSED: "date_not_passed",
        DATE_PASSED: "date_passed",
    }

    /****************************************************
     * INITIALIZATION
     ****************************************************/

    /* Import data from json file, then start D3 */
    $.ajaxSetup({
        beforeSend: function (xhr) {
            if (wpApiSettings && wpApiSettings.nonce) {
                xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
            }
        }
    });

    $.get(config.apiUrl + "/tapestries/" + config.wpPostId, function(result){
        tapestry.dataset = result;
        if (tapestry.dataset && tapestry.dataset.nodes && tapestry.dataset.nodes.length > 0) {
            for (var i=0; i<tapestry.dataset.nodes.length; i++) {

                // change http(s):// to // in media URLs
                if (typeof tapestry.dataset.nodes[i].typeData != "undefined" && tapestry.dataset.nodes[i].typeData.mediaURL && tapestry.dataset.nodes[i].typeData.mediaURL.length > 0) {
                    tapestry.dataset.nodes[i].typeData.mediaURL = tapestry.dataset.nodes[i].typeData.mediaURL.replace(/(http(s?)):\/\//gi, '//');
                }

                if (renderImages) {
                    // change http(s):// to // in image URLs
                    if (typeof tapestry.dataset.nodes[i].imageURL != "undefined" && tapestry.dataset.nodes[i].imageURL.length > 0) {
                        tapestry.dataset.nodes[i].imageURL = tapestry.dataset.nodes[i].imageURL.replace(/(http(s?)):\/\//gi, '//');
                    }
                    if (typeof tapestry.dataset.nodes[i].lockedImageURL != "undefined" && tapestry.dataset.nodes[i].lockedImageURL.length > 0) {
                        tapestry.dataset.nodes[i].lockedImageURL = tapestry.dataset.nodes[i].lockedImageURL.replace(/(http(s?)):\/\//gi, '//');
                    }
                }
                else {
                    // turn off thumbnails
                    tapestry.dataset.nodes[i].imageURL = "";
                    tapestry.dataset.nodes[i].lockedImageURL = "";
                }
            }
        }

        tapestrySlug = tapestry.dataset.settings.tapestrySlug;
        if (tapestry.dataset.settings.autoLayout) {
            autoLayout = tapestry.dataset.settings.autoLayout;
            xORfx = autoLayout ? 'x' : 'fx';
            yORfy = autoLayout ? 'y' : 'fy';
        }

		var nodeIds = [];
        for (var i=0; i < tapestry.dataset.nodes.length; i++) {
            if (autoLayout) {
                delete tapestry.dataset.nodes[i].fx;
                delete tapestry.dataset.nodes[i].fy;
            }
            else {
                tapestry.dataset.nodes[i].fx = tapestry.dataset.nodes[i].coordinates.x;
                tapestry.dataset.nodes[i].fy = tapestry.dataset.nodes[i].coordinates.y;
            }
			nodeIds.push(tapestry.dataset.nodes[i].id);
        }

		// Delete links that connect to a non-existing node due to possibly corrupted data
		tapestry.dataset.links = tapestry.dataset.links.filter(
            thisLink => nodeIds.includes(thisLink.source) && nodeIds.includes(thisLink.target));

        tapestry.originalDataset = tapestry.dataset;
        
        root = tapestry.dataset.rootId;
        
        if (saveProgress) {

            //---------------------------------------------------
            // GET PROGRESS FROM DATABASE OR COOKIE (IF ENABLED)
            //---------------------------------------------------
            $.get(USER_NODE_PROGRESS_URL, { "post_id": config.wpPostId }, function(retrievedUserProgress) {
                if (retrievedUserProgress && !isEmptyObject(retrievedUserProgress)) {
                    let progress = retrievedUserProgress;

                    if (!wpUserId) {
                        const localProgress = localStorage.getItem("tapestry-progress");
                        if (localProgress) {
                            const userProgress = JSON.parse(localProgress);
                            Object.keys(progress)
                                .filter(nodeId => userProgress.hasOwnProperty(nodeId))
                                .forEach(nodeId => {
                                    const nodeProgress = userProgress[nodeId]
                                    const newProgress = progress[nodeId]
                                    newProgress.completed = nodeProgress.completed
                                    newProgress.unlocked = nodeProgress.unlocked
                                    newProgress.accessible = nodeProgress.accessible
                                    newProgress.progress = nodeProgress.progress
                                })
                        }
                    }
                    setDatasetProgress(progress);
                }
            })
            .fail(function(e) {
                console.error("Error with retrieving node progress");
                console.error(e);
            })
            .complete(function(){
                tapestry.init();
            });
        }
    }).fail(function(e) {
        console.error("Error with loading tapestries");
        console.error(e);
    });

    this.canCurrentUserEdit = () => Boolean(config.wpCanEditTapestry.length)

    this.init = function(isReload = false) {
        const exceptions = ["administrator", "author", "editor"];

        const { roles: allRoles } = wp;
        const roles = Object.keys(allRoles).filter(key => !exceptions.includes(key));

        var reorderPermissions = permissions => {
            var withoutDuplicates = new Set(["public", "authenticated", ...roles, ...Object.keys(permissions)])
            return [...withoutDuplicates];
        }

        const getDefaultRoles = () => {
            const obj = {}
            Object.keys(allRoles)
                .filter(key => !exceptions.includes(key))
                .forEach(role => (obj[role] = ["read"]));
            return obj;
        }

        this.dataset.nodes = this.dataset.nodes.map(node => {
            var updatedNode = fillEmptyFields(node, { 
                accordionProgress: [], 
                skippable: true, 
                behaviour: "embed", 
                completed: false, 
                quiz: [], 
                mayUnlockNodes: []      // ths keeps track of all nodes that may get unlocked by this node
            })
            updatedNode.permissions = fillEmptyFields(
                updatedNode.permissions, 
                { authenticated: ["read"], ...getDefaultRoles() }
            );
            updatedNode.permissionsOrder = reorderPermissions(updatedNode.permissions);

            const getDirectChildren = id => this.dataset.links
                .filter(link => link.source == id)
                .map(link => link.target)

            if (node.mediaType === "accordion") {
                const accordionRowIds = getDirectChildren(node.id)
                accordionRowIds.forEach(accordionRowId => {
                    const accordionRow = this.dataset.nodes[findNodeIndex(accordionRowId)]
                    accordionRow.presentationStyle = "accordion-row"
                    const subRows = getDirectChildren(accordionRowId)
                    if (subRows.length) {
                        accordionRow.isSubAccordion = true;
                    }
                    subRows.forEach(id => {
                        const subRow = this.dataset.nodes[findNodeIndex(id)]
                        subRow.presentationStyle = "accordion-row"
                    })
                })
            }

            return updatedNode
        });

        visibleNodes = new Set(this.dataset.nodes.map(n => n.id))

        this.updateAccordionProgress();

        dispatchEvent(new CustomEvent('tapestry-updated', { 
            detail: { dataset: { ...this.dataset } }
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

        if (!isReload) {
            svg = createSvgContainer(TAPESTRY_CONTAINER_ID);
        }

        if (!isReload && typeof tapestry.dataset.settings.defaultDepth !== "undefined") {
            tapestryDepth = tapestry.dataset.settings.defaultDepth
        }

        addDepthToNodes(root);
        setNodeTypes(root);
        setLinkTypes(root);
        addDepthToNodes(root);

        // add in the controls
        if (!isReload) {
            document.getElementById(TAPESTRY_CONTAINER_ID).prepend(tapestry.getControls());
        }
        
        links = createLinks();
        nodes = createNodes();

        this.updateVisibleNodes();
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
            recordAnalyticsEvent('app', 'load', 'tapestry', config.wpPostId);
        }

        if(config.wpCanEditTapestry || tapestry.dataset.settings.nodeDraggable !== false) {
            initializeDragSelect();
        }
    }

    this.disableMovements = () => {
        movementsEnabled = false;
    }

    this.enableMovements = () => {
        movementsEnabled = true;
    }

    this.resetNodeCache = function() {
        childrenOfNodeAtDepth = {}
    }

    this.selectNode = function(id) {
        root = id
        tapestry.resetNodeCache();
        resizeNodes(id);
        addDepthToNodes(id);

        dispatchEvent(new CustomEvent('change-selected-node', { detail: id }));

        if (tapestryDepth) {
            // slider's maximum depth is set to the longest path from the new selected node
            tapestryDepthSlider.max = findMaxDepth(id) + 1;
        }

        updateSvgDimensions();
        renderTooltips()
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
        if (renderImages) {
            const { backgroundUrl } = tapestry.dataset.settings;
            const htmlBody = document.getElementsByTagName("BODY")[0];
            htmlBody.style.background = backgroundUrl ? `url(${backgroundUrl})` : "";
            htmlBody.style.backgroundSize = "cover";
        }
    }

    this.getControls = function() {
        
        //--------------------------------------------------
        // Create wrapper div for tapestry controls
        //--------------------------------------------------
        
        var tapestryControlsDiv = document.createElement("div");
        tapestryControlsDiv.id = "tapestry-controls-wrapper";

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
        // Add in Depth Slider
        //--------------------------------------------------
        if (tapestryDepth) {

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
                min:"1",
                max:"4",
                id:"tapestry-depth-slider"
            });
            depthSliderWrapper.appendChild(tapestryDepthSlider);

            // Every time the slider's value is changed, do the following
            tapestryDepthSlider.onchange = function() {
                tapestryDepth = this.value;
                updateDepthMessage();
            
                setNodeTypes(root);
                setLinkTypes(root);

                filterTapestry();
                updateSvgDimensions();
            };
            tapestryDepthSlider.max = findMaxDepth(root) + 1;
            tapestryDepthSlider.value = tapestryDepth;
            tapestryControlsDiv.appendChild(depthSliderWrapper);

            const messageWrapper = document.createElement("p");
            messageWrapper.id = "depth-warning-message";
            messageWrapper.textContent = `Some nodes might be hidden because you're not at max depth.`;
            messageWrapper.style.opacity = shouldShowMessage() ? "1" : "0";

            tapestryControlsDiv.appendChild(messageWrapper);

            var showDepthSlider = findMaxDepth(root) >= 2;
            // Hide depth slider if depth is less than 3 
            depthSliderWrapper.style.display = showDepthSlider ? "flex" : "none";
            if (showDepthSlider) {
                settingsButton.style.marginLeft = "10px";
            }

            tapestryControlsDiv.style.display = (showDepthSlider || showSettings) ? "flex" : "none";
        }

        return tapestryControlsDiv;
    }

    function updateDepthMessage() {
        const messageWrapper = document.getElementById("depth-warning-message");
        messageWrapper.style.opacity = shouldShowMessage() ? "1" : "0";
    }

    function shouldShowMessage() {
        return tapestryDepthSlider.value !== tapestryDepthSlider.max
    }
    
    /****************************************************
     * ADD EDITOR ELEMENTS
     ****************************************************/

    if(config.wpCanEditTapestry || tapestry.dataset.settings.nodeDraggable !== false) {

        selection = createSelection();
        isMultiSelect = false;

        document.addEventListener("keydown", evt => {
            if (movementsEnabled) {
                if (evt.code === "Escape") {
                    selection.clear();
                }
                if (evt.ctrlKey || evt.shiftKey || evt.metaKey) {
                    isMultiSelect = true;
                    if (evt.code === "KeyA") {
                        evt.preventDefault();
                        tapestry.dataset.nodes.forEach(d => selection.add(d));
                    }
                }
            }
        });

        document.addEventListener("keyup", () => {
            if (movementsEnabled) {
                isMultiSelect = false;
            }
        });

        function createSelection() {
            const data = new Set();
            const selection = {
                data,
                size() {
                    return data.size;
                },
                add(node) {
                    data.add(node);
                    data.forEach(d => {
                        const nd = document.getElementById(`node-${d.id}`);
                        nd.classList.add("node-selected");
                    })
                },
                has(node) {
                    return data.has(node);
                },
                delete(node) {
                    data.delete(node);
                    const nd = document.getElementById(`node-${node.id}`);
                    nd.classList.remove("node-selected");
                },
                clear() {
                    data.forEach(d => {
                        selection.delete(d);
                    })
                },
                forEach(fn) {
                    data.forEach(fn);
                }
            }
            return selection;
        }
    }
    
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
    
        $.post(config.apiUrl + "/tapestries/" + config.wpPostId + "/links", JSON.stringify({"source": source, "target": target, "value": value, "type": "", "appearsAt": appearsAt }), function() {
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
                            const sourceNode = getNodeById(source);
                            if (sourceNode.mediaType === "accordion" || sourceNode.presentationStyle === "accordion-row") {
                                if (sourceNode.childOrdering.includes(target)) {
                                    sourceNode.childOrdering = sourceNode.childOrdering.filter(id => id !== target);
                                }
                            }
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
    
    this.tapestryDeleteNode = function(nodeId = root) {
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
            alert("Cannot delete this node. \n\nOnly nodes with a single connection can be deleted.");
        } else {
            $.ajax({
                url: apiUrl + "/tapestries/" + config.wpPostId + "/nodes/" + nodeId,
                method: API_DELETE_METHOD,
                success: function() {
                    location.reload();
                },
                error: function(e) {
                    console.error("Error deleting node " + nodeId, e);
                }
            });
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

    const filterOptions = {
        AUTHOR: "author"
    }

    this.updateVisibleNodes = (opt, val) => {
        // Only update if we're moving from or to a filter route. This prevents
        // unnecessary rerenders when opening lightboxes.
        let newVisibleNodes = tapestry.dataset.nodes
        if (opt && val) {
            switch (opt) {
                case filterOptions.AUTHOR:
                    newVisibleNodes = 
                        tapestry.dataset.nodes.filter(n => n.author.id == val)
                    break
                default:
                    break
            }
        }
        visibleNodes = new Set(newVisibleNodes.map(n => n.id))
        resizeNodes(root)
    }   
    
    /****************************************************
     * D3 RELATED FUNCTIONS
     ****************************************************/

    /* Define forces that will determine the layout of the graph */
    function startSimulation() {

        if (autoLayout) {
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

        // To improve performance while tapestry is not being actively used, we won't run these functions
        if (!movementsEnabled) {
            return;
        }

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

    function dragstarted(d) {
        if (movementsEnabled) {
            if(!config.wpCanEditTapestry &&
                tapestry.dataset.settings.nodeDraggable === false) {
                return;
            }
     
            if (!d3.event.active) simulation.alphaTarget(0.2).restart();
    
            if (!selection.size()) {
                selection.add(d)
            }
            if (!selection.has(d) && !isMultiSelect) {
                selection.clear();
                selection.add(d);
            }
            
            nodesBeforeDrag = Array
                .from(selection.data)
                .map(node => ({ id: node.id, x: node.x, y: node.y }));

            renderTooltips()
            recordAnalyticsEvent('user', 'drag-start', 'node', d.id, {'x': d.x, 'y': d.y});
        }
    }

    function dragged(d) {
        if(!config.wpCanEditTapestry &&
            tapestry.dataset.settings.nodeDraggable === false) {
            return;
        }
        selection.forEach(nd => {
            nd[xORfx] = nd[xORfx] + d3.event.dx;
            nd[yORfy] = nd[yORfy] + d3.event.dy;
        })
    }

    function dragended(d) {
        if(!config.wpCanEditTapestry &&
            tapestry.dataset.settings.nodeDraggable === false) {
            return;
        }

        if (!d3.event.active) simulation.alphaTarget(0);

        selection.forEach(nd => {
            nd[xORfx] = nd.x;
            nd[yORfy] = nd.y;
            if (canEditNode(nd) && !autoLayout) {
                $.ajax({
                    url: config.apiUrl + "/tapestries/" + config.wpPostId + "/nodes/" + nd.id + "/coordinates",
                    method: API_PUT_METHOD,
                    data: JSON.stringify({x: nd.x, y: nd.y}),
                    error: function(e) {
                        alert("Sorry, there was an error saving the coordinates of this node!");
                        console.error(e);
                        nd[xORfx] = nodesBeforeDrag.find(n => n.id == nd.id).x;
                        nd[yORfy] = nodesBeforeDrag.find(n => n.id == nd.id).y;
                    }
                });
            }
        })

        if (selection.size() === 1) {
            selection.forEach(nd => {
                const prev = nodesBeforeDrag.find(n => n.id == nd.id)
                const { x, y } = prev
                if (x != nd.x || y != nd.y) {
                    selection.clear()
                }
            })
        }

        updateSvgDimensions();
        renderTooltips();
        recordAnalyticsEvent('user', 'drag-end', 'node', d.id, {'x': d.x, 'y': d.y});
    }

    function createSvgContainer() {

        // hide the container so we can smoothly fade it in at the end of this function
        $("#"+TAPESTRY_CONTAINER_ID).hide();

        // actually create the SVG
        var tapestryDimensions = tapestry.getTapestryDimensions();
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
            svg.select("g.links").remove()
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
            .style("opacity", d => 
                visibleNodes.has(d.source.id) && visibleNodes.has(d.target.id) ? "1" : "0.2"
            );
    
        // Hide Links
    
        var linksToHide = links.filter(function (d) {
            return !( getViewable(getNodeById(d.target.id)) && getViewable(getNodeById(d.source.id)) );
        });
    
        linksToHide
            .transition()
            .duration(TRANSITION_DURATION/2)
            .style("opacity", "0");
    
        // Show Nodes
    
        var nodesToShow = nodes.filter(function (d) {
            return getViewable(d);
        });
    
        nodesToShow
            .transition()
            .duration(TRANSITION_DURATION/2)
            .style("opacity", d => visibleNodes.has(d.id) ? "1" : "0.4");
        
        // Hide Nodes
    
        var nodesToHide = nodes.filter(function (d) {
            return !getViewable(d);
        });
    
        nodesToHide
            .transition()
            .duration(TRANSITION_DURATION)
            .style("opacity", "0");
        
        if (freshBuild) {
            buildNodeContents();
        }
        else {
            rebuildNodeContents();
        }
    }

    function initializeDragSelect() {
        new DragSelect({
            area: document.getElementById('tapestry-container'),
            selectables: document.querySelectorAll(".node"),
            onDragStart: (e) => {
                let depthSliderWrapper = document.querySelector("#tapestry-controls-wrapper");
                if (depthSliderWrapper === e.target || depthSliderWrapper.contains(e.target)) {
                    this.break();
                }    
                if (!isMultiSelect) {
                    selection.clear()
                }
            },
            onElementSelect: node => {
                if (movementsEnabled) {
                    const id = node.id.split("node-")[1]
                    selection.add(tapestry.dataset.nodes[findNodeIndex(id)])
                }
            },
            onElementUnselect: node => {
                const id = node.id.split("node-")[1]
                selection.delete(tapestry.dataset.nodes[findNodeIndex(id)])
            }
        });
    }

    function handleClick(d) {
        if (root === d.id && d.hideMedia) {
            if (config.wpCanEditTapestry || d.accessible) {
                goToNode(d.id)
            }
        }
    }
    
    /* Draws the components that make up node */
    function buildNodeContents() {
        if (tapestryDepth) {
            tapestryDepthSlider.max = findMaxDepth(root) + 1;
        }

        /* Draws the circle that defines how large the node is */
        nodes.append("rect")
            .attr("class", function (d) {
                var classes = "imageContainer"
                if (d.nodeType === "grandchild") classes += " grandchild"
                return classes;
            })
            .attr("rx", function (d) {
                if (d.hideProgress && (d.accessible ? d.imageURL.length : d.lockedImageURL.length)) {
                    return 0;
                }
                return getRadius(d);
            })
            .attr("ry", function (d) {
                if (d.hideProgress && (d.accessible ? d.imageURL.length : d.lockedImageURL.length)) {
                    return 0;
                }
                return getRadius(d);
            })
            .attr("data-id", function (d) {
                return d.id;
            })
            .attr("stroke-width", function (d) {
                if (!d.hideProgress) {
                    return PROGRESS_THICKNESS;
                }
            })
            .attr("stroke", function (d) {
                if (!getViewable(d) || d.hideProgress)
                    return "transparent";
                else if (d.nodeType === "grandchild")
                    return COLOR_GRANDCHILD;
                else if (!d.accessible)
                    return COLOR_LINK;
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
                if (!d.accessible) {
                    if (d.lockedImageURL && d.lockedImageURL.length)
                        return "url('#node-locked-thumb-" + d.id + "')";
                    else
                        return COLOR_LOCKED;
                }
                if (d.imageURL && d.imageURL.length)
                    return "url('#node-thumb-" + d.id + "')";
                return COLOR_BLANK_HOVER;
            })
            .on("click keydown", handleClick);
        
        
        nodes.append("rect")
            .attr("class", function (d) {
                if (d.nodeType === "grandchild") return "selectable grandchild";
                return "selectable";
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
                    return PROGRESS_THICKNESS;
                }
            })
            .attr("stroke", function (d) {
                if (!getViewable(d) || d.hideProgress)
                    return "transparent";
                else if (d.nodeType === "grandchild")
                    return COLOR_GRANDCHILD;
                else if (!d.accessible)
                    return COLOR_LINK;
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
            .on("click keydown", handleClick);

        nodes.append("circle")
            .filter(function (d) {
                // no overlay if hiding progress and there is an image
                // or no overlay if node is locked and has a locked image
                return !(d.hideProgress && (d.accessible ? d.imageURL.length : d.lockedImageURL.length));
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
            })
            .on("click keydown", handleClick);
    
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
        
        
        nodes.append("defs")
            .append("pattern")
            .attr("id", function (d) {
                return "node-locked-thumb-" + d.id;
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
                return d.lockedImageURL;
            });

        /* Add path and button */
        buildPathAndButton();

        setNodeListeners(nodes);
    
        /* Add dragging and node selection functionality to the node */
        if (config.wpCanEditTapestry || tapestry.dataset.settings.nodeDraggable !== false) {
            nodes
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
                )
                .on("click keydown", function (d) {
                    recordAnalyticsEvent('user', 'click', 'node', d.id);
                    if (root != d.id) { // prevent multiple clicks
                        if (config.wpCanEditTapestry || d.accessible) {
                            if (!isMultiSelect) {
                                selection.clear();
                                tapestry.selectNode(d.id);
                            } else {
                                selection.add(d);
                            }
                        }
                    }
                });
        }
        else {
            nodes
            .on("click keydown", function (d) {
                recordAnalyticsEvent('user', 'click', 'node', d.id);
                if (root != d.id) { // prevent multiple clicks
                    if (config.wpCanEditTapestry || d.accessible) {
                        tapestry.selectNode(d.id);
                    }
                }
            });
        }
            
    }

    function renderTooltips() {
        const tooltipWidth = d => Math.min(getRadius(d) * 2 + 48, 400)
        nodes.selectAll(".tooltip-wrapper").remove();
        nodes
            .filter(d => !d.accessible)
            .append("foreignObject")
            .attr("class", "tooltip-wrapper")
            .style("position", "relative")
            .attr("width", tooltipWidth)
            .attr("height", d => getRadius(d) * 2)
            .attr("x", d => -(Math.min(getRadius(d) * 2 + 48, 400) / 2))
            .attr("y", d => {
                const tooltipHeight = getRadius(d) * 2.5
                const yPosition = d.y - tapestry.getTapestryDimensions().startY
                const onBottom = (d.y - tapestry.getTapestryDimensions().startY < tooltipHeight 
                    || yPosition - (getRadius(d) * 2) <= $(window).scrollTop()) && d.x > 0 && d.y > 0
                return onBottom ? getRadius(d) + 27.5 + 5 : -(getRadius(d) * 3 + 27.5 + 20)
            })
            .append("xhtml:div")
            .attr("class", "tapestry-tooltip")
            .style("align-items", d => {
                const tooltipHeight = getRadius(d) * 2.5
                const yPosition = d.y - tapestry.getTapestryDimensions().startY
                const onBottom = (yPosition < tooltipHeight 
                    || yPosition - (getRadius(d) * 2) <= $(window).scrollTop()) && d.x > 0 && d.y > 0
                return onBottom ? "flex-start" : "flex-end"
            })
            .append("xhtml:div")
            .attr("class", "tapestry-tooltip-content")
            .html(getTooltipHtml)
            .on("click", () => {
                d3.event.stopPropagation()
            })

        nodes.filter(d => !d.accessible)
            .select(".button-node-tooltip")
            .on("click", function() {
                goToNode(this.dataset.node)
            })

        nodes.selectAll(".tooltip-pointer").remove();
        nodes
            .filter(d => !d.accessible)
            .append("polygon")
            .attr("class", "tooltip-pointer")
            .attr("points", function(d) {
                const tooltipHeight = getRadius(d) * 2.5
                const yPosition = d.y - tapestry.getTapestryDimensions().startY
                const onBottom = (yPosition < tooltipHeight 
                    || yPosition - (getRadius(d) * 2) <= $(window).scrollTop()) && d.x > 0 && d.y > 0
                const yOffset = onBottom ? -(getRadius(d) * 3 + 27.5 + 5 - getRadius(d) * 2) : getRadius(d) * 3 + 27.5 + 20 - getRadius(d) * 2
                const points = onBottom ? [[-16, 16 - yOffset], [16, 16 - yOffset], [0, -16 - yOffset]] : [[-16, -16 - yOffset], [16, -16 - yOffset], [0, 16 - yOffset]]
                return points.map(point => point.join(",")).join(" ")
            })
            .attr("fill", "black")
            .style("opacity", 0)
    }

    function setNodeListeners(nodes) {

        // Create tooltip for all locked nodes
        renderTooltips();

        // Remove (potentially) old listeners
        nodes.on("mouseover", null).on("mouseout", null).on("mouseleave", null);

        nodes.on("mouseover", function (thisNode) {
            // Place this node at the end of the svg so that it appears on top
            $(this).insertAfter($(this).parent().children().last())

            // Mark this node as the node to link to (potentially)
            if (linkToDragStarted) {
                linkToNode = thisNode;
            }
        }).on("mouseout", function () {

            // Unmark this node as the node to link to
            if (linkToDragStarted) {
                linkToNode = undefined;
            }
        });

        nodes
            .filter(thisNode => !thisNode.accessible)
            .on("mouseover", function (thisNode) {

                // Place this node at the end of the svg so that it appears on top
                $(this).insertAfter($(this).parent().children().last())

                // Show unlock conditions tooltip
                if (thisNode.nodeType !== "grandchild") {
                    const wrapper = this.querySelector(".tooltip-wrapper");
                    const pointer = this.querySelector("polygon.tooltip-pointer");
                    pointer.style.opacity = 1;
                    wrapper.style.display = "block";
                }

                if (linkToDragStarted && checkPermission(thisNode, "add")) {
                    linkToNode = thisNode;
                }
            })
            .on("mouseleave", function (thisNode) {
                // Hide unlock conditions tooltip
                const wrapper = this.querySelector(".tooltip-wrapper");
                const pointer = this.querySelector("polygon.tooltip-pointer");
                pointer.style.opacity = 0;
                wrapper.style.display = "none";

                if (linkToDragStarted && checkPermission(thisNode, "add")) {
                    linkToNode = undefined;
                }
            })
    }

    function getTooltipHtml(node) {
        if (!wpUserId) {
            const completeCondition = node.conditions.find(cond => cond.type === conditionTypes.NODE_COMPLETED)
            if (completeCondition) {
                return "Please login to unlock this node."
            }
        }

        const str = "This node will be unlocked: <br />";
        const wrapper = document.createElement("ul");

        if (node.conditions.length === 0 || node.conditions.every(cond => cond.fulfilled)) {
            const listItem = document.createElement("li");
            const btn = createNodeButton(getParent(node))
            listItem.innerHTML = `When ${btn} is unlocked.`;
            wrapper.appendChild(listItem);
        } else {
            node.conditions.forEach(cond => {
                if (!cond.fulfilled) {
                    const listItem = document.createElement("li");
                    switch (cond.type) {
                        case conditionTypes.NODE_COMPLETED: {
                            const node = getNodeById(cond.nodeId);
                            const btn = createNodeButton(node)
                            listItem.innerHTML = `When ${btn} is completed.`;
                            break;
                        }
                        case conditionTypes.DATE_PASSED: {
                            listItem.innerText = `After ${formatDate(cond)}.`;
                            break;
                        }
                        case conditionTypes.DATE_NOT_PASSED: {
                            listItem.innerText = `Until ${formatDate(cond)}.`;
                            break;
                        }
                        default:
                            break;
                    }
                    wrapper.appendChild(listItem);
                }
            })
        }
        return str + wrapper.outerHTML;
    }

    function createNodeButton(node) {
        if (!node) {
            return 'preceding content';
        }
        return `<button class="button-node-tooltip" data-node=${node.id}>${node.title}</button>`
    }

    function formatDate({ date, time, timezone }) {
        const formatStr = `MMM D YYYY [at] h:mm a [(${timezone})]`
        if (!time) {
            return moment.tz(date, timezone).format(formatStr)
        }
        return moment.tz(`${date} ${time}`, timezone).format(formatStr)
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
                    } else if (rad > (PROGRESS_THICKNESS / 2)) {
                        return rad - (PROGRESS_THICKNESS / 2);
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
                    if (d.hideProgress && (d.accessible ? d.imageURL.length : d.lockedImageURL.length)) {
                        return 0;
                    }
                    return getRadius(d);
                })
                .attr("ry", function (d) {
                    if (d.hideProgress && (d.accessible ? d.imageURL.length : d.lockedImageURL.length)) {
                        return 0;
                    }
                    return getRadius(d);
                })
                .attr("stroke", function (d) {
                    if (!getViewable(d) || d.hideProgress)
                        return "transparent";
                    else if (d.nodeType === "grandchild") 
                        return COLOR_GRANDCHILD;
                    else if (!d.accessible)
                        return COLOR_LINK;
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
                    if (!d.accessible) {
                        if (d.lockedImageURL && d.lockedImageURL.length)
                            return "url('#node-locked-thumb-" + d.id + "')";
                        else
                            return COLOR_LOCKED;
                    }
                    if (d.imageURL.length)
                        return "url('#node-thumb-" + d.id + "')";
                    return COLOR_BLANK_HOVER;
                })
                .attr("stroke-width", function (d) {
                    if (!d.hideProgress) {
                        return PROGRESS_THICKNESS;
                    }
                });

        nodes.selectAll(".selectable")
            .attr("class", function (d) {
                if (!getViewable(d))
                    return "selectable grandchild";
                else return "selectable";
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
                else if (!d.accessible)
                    return COLOR_LINK;
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
            .attr("stroke-width", function (d) {
                if (!d.hideProgress) {
                    return PROGRESS_THICKNESS;
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
    
        nodes.selectAll(".mediaButton").remove();
        nodes.selectAll(".editNodeButton").remove();
        nodes.selectAll(".addNodeButton").remove();
        nodes.selectAll(".metaWrapper").remove();
        nodes.selectAll(".tooltip-wrapper").remove();
        nodes.selectAll(".tooltip-pointer").remove();
        nodes.selectAll("path").remove();

        setTimeout(function(){
            renderTooltips();
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
                return getViewable(d) && (!d.hideTitle || !renderImages);
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
            .on("click keydown", handleClick)
            .append("xhtml:div")
                .attr("class","meta")
                .html(function(d){
                var base = "<p class='title'>" + d.title + "</p>";
                if (d.mediaDuration) {
                    base += "\n<p class='timecode'>" + getVideoDuration(d.mediaDuration) + "</p>";
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
            .attr("data-unlocked", function (d) {
                return d.accessible;
            })
            .html(function (d) {
                return '<i id="mediaButtonIcon' + d.id + '"' + 
                    ' class="' + getIconClass(d.mediaType, 'play', d.accessible) + ' mediaButtonIcon"' +
                    ' data-id="' + d.id + '"' + 
                    ' data-unlocked="' + d.accessible + '"' + 
                    ' data-format="' + d.mediaFormat + '"' + 
                    ' data-media-type="' + d.mediaType + '"' +
                    ' data-fullscreen="' + d.fullscreen + '"' +
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
                return -NORMAL_RADIUS - 30 - (d.nodeType === "root" ? ROOT_RADIUS_DIFF : 0);
            })
            .attr("style", function (d) {
                return (d.nodeType === "grandchild" || d.hideMedia) ? "visibility: hidden" : "visibility: visible";
            })
            .attr("class", "mediaButton");
    
        $('.mediaButton > i').click(function(){
            var thisBtn = $(this)[0];
            if (thisBtn.dataset.unlocked === "true" || config.wpCanEditTapestry) {
                goToNode(thisBtn.dataset.id);
            }
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
                if (d.nodeType === "grandchild" || d.nodeType === "child") {
                    return "visibility: hidden";
                }
                return "visibility: visible";
            })
            .attr("class", "mediaButton addNodeButton")
            .call(d3.drag()
                .on('start',function(thisNode){
                    linkFromNode = thisNode;
                })
                .on('drag',function(){  
                    linkToDragStarted = true;
                    nodeLinkLine.setAttribute('x1',linkFromNode.x - 20);
                    nodeLinkLine.setAttribute('y1',linkFromNode.y + MAX_RADIUS - 10);
                    nodeLinkLine.setAttribute('x2',d3.event.x);
                    nodeLinkLine.setAttribute('y2',d3.event.y + MAX_RADIUS - 10);
                })
                .on('end',function(){
                    if (typeof linkToNode != "undefined" && linkFromNode.id != linkToNode.id) {
                        const shouldAddLink = confirm(`Link from ${linkFromNode.title} to ${linkToNode.title}?`);

                        if (!shouldAddLink) {
                            return;
                        }

                        const isAccordion = node => {
                            if (node.mediaType === "accordion") {
                                return true;
                            }
                            const parent = getParent(node);
                            return parent ? parent.mediaType === "accordion" : false;
                        };

                        const getLinkState = (source, target) => {
                            if (isAccordion(source) && isAccordion(target)) {
                                return { state: "NORMAL", data: { source, target } };
                            }
                            if (isAccordion(source) || isAccordion(target)) {
                                return {
                                    state: "ADD-ROW",
                                    data: {
                                        source: isAccordion(source) ? source : target,
                                        target: isAccordion(source) ? target : source
                                    }
                                }
                            }
                            return { state: "NORMAL", data: { source, target } };
                        };
                        const { state, data: { source, target } } = getLinkState(linkFromNode, linkToNode);
                        if (state === "ADD-ROW") {
                            const shouldAddRow = confirm(`Add ${target.title} as a row of ${source.title}?`);
                            if (shouldAddRow) {
                                source.childOrdering.push(target.id);
                            }
                        }
                        addLink(source.id, target.id, 1, '')
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

    function goToNode(nodeId) {
        dispatchEvent(new CustomEvent("tapestry-open-node", { detail: { id: nodeId } }));
        recordAnalyticsEvent('user', 'open', 'lightbox', nodeId);
    }

    function getVideoDuration(seconds) {
        seconds = Math.floor(seconds);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        var sec = Math.floor(seconds - (hours * 3600) - (minutes * 60));

        if (sec < 10)
            sec = "0" + sec;

        if (hours > 0 && minutes < 10)
            minutes = "0" + minutes;
        
        if (hours === 0)
            return minutes + ":" + sec;

        return hours + ":" + minutes + ":" + sec;
    }

    function updateViewedProgress() {
        if (nodes) {
            path = nodes
                .filter(function (d) {
                    return !d.hideProgress && d.accessible;
                })
                .selectAll("path")
                .data(function (d, i) {
                    var data = d.typeData.progress;
                    if (!data) {
                        data = [ {'value': 0}, {'value': 1 } ];
                    }
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
        arcGenerator.innerRadius(innerRadius + addedRadius + addedRadiusInner)(d);
        arcGenerator.outerRadius(outerRadius + addedRadius)(d);
        return d;
    }
    
    /****************************************************
     * MEDIA RELATED FUNCTIONS
     ****************************************************/

    this.reload = () => {
        setNodeListeners(nodes);
        filterTapestry();
        renderTooltips();
    }

    this.reloadTooltips = renderTooltips

    this.updateProgressBars = updateViewedProgress;

    this.recordAnalyticsEvent = recordAnalyticsEvent;
    
    /****************************************************
     * HELPER FUNCTIONS
     ****************************************************/
    
    function getParent(node) {
        const links = tapestry.dataset.links;
        const link = links.find(l => l.target == node.id || l.target.id == node.id);
        if (!link) {
            return null
        }
        return typeof link.source === "object" 
            ? link.source 
            : getNodeById(link.source);
    }

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
        var minPointX = 30000;
        var minPointY = 30000;
                    
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

        if (hardCodedDimensions) {
            return hardCodedDimensions;
        }

        var tapestryWidth = document.getElementById(TAPESTRY_CONTAINER_ID).offsetWidth;
        var tapestryHeight = getBrowserHeight() - document.getElementById(TAPESTRY_CONTAINER_ID).offsetTop;
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
        if (!config.wpCanEditTapestry && tapestry.dataset.settings.nodeDraggable === false) {
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
        // Update svg dimensions to the new dimensions of the browser
        updateSvgDimensions();
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
        if ((node.accessible ? node.imageURL.length : node.lockedImageURL.length) === 0) {
            base += " imageOverlay--no-image";
        }
        if (!node.accessible) {
            base += " locked";
        }
        return base;
    }

    function getNodeColor(node) {
        if (!getViewable(node) || (!node.accessible && node.lockedImageURL.length))
            return "transparent";
        if (node.nodeType === "grandchild")
            return COLOR_GRANDCHILD;
        if (node.accessible && node.imageURL.length === 0)
            return COLOR_BLANK;
        if (!node.accessible)
            return COLOR_LOCKED;
        return COLOR_STROKE;
    }

    function getBoundedCoord(coord, maxCoord) {
    
        return Math.max(MAX_RADIUS, Math.min(maxCoord - MAX_RADIUS, coord));
    }

    /* Add 'depth' parameter to each node recursively. 
        The depth is determined by the number of levels from the root each node is. */
    function addDepthToNodes(id) {

        if (!tapestryDepth) {
            return;
        }

        for (let node of tapestry.dataset.nodes) {
            node.depth = Number.POSITIVE_INFINITY;
        }
        tapestry.dataset.nodes[findNodeIndex(id)].depth = 0;

        for (let i = 0; i < tapestry.dataset.nodes.length - 1; i++) {
            let changed = false;
            for (let link of tapestry.dataset.links) {
                if (link.source.depth > link.target.depth + 1) {
                    link.source.depth = link.target.depth + 1;
                    changed = true;
                }
                if (link.target.depth > link.source.depth + 1) {
                    link.target.depth = link.source.depth + 1;
                    changed = true;
                }
            }
            if (!changed) {
                break;
            }
        }
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
    this.findMaxDepth = findMaxDepth;

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
            radius = NORMAL_RADIUS + ROOT_RADIUS_DIFF;
        } else if (d.nodeType === "grandchild") {
            radius = NORMAL_RADIUS + GRANDCHILD_RADIUS_DIFF;
        } else {
            radius = NORMAL_RADIUS;
        }
        return radius;
    }
    
    this.updateAccordionProgress = function() {
        const accordions = tapestry.dataset.nodes.filter(nd => nd.mediaType === "accordion");

        accordions.forEach(node => {
            const progress = []
            const rows = tapestry.dataset.links
                .filter(link => link.source == node.id || link.source.id == node.id)
                .map(link => link.target.id || link.target);
            const completedRows = rows
                .map(getNodeById)
                .filter(row => row.completed);
            completedRows.forEach(row => progress.push(row.id));
            node.accordionProgress = progress;
            
            const currProgress = rows.length ? progress.length / rows.length : 1;
            node.typeData.progress[0].value = currProgress;
            node.typeData.progress[1].value = 1 - currProgress;
            if (currProgress === 1) {
                node.completed = true;                
            }
        });
    }

    function setDatasetProgress(progressObj) {
        if (progressObj.length < 1) {
            return false;
        }

        if (!wpUserId) {
            localStorage.setItem("tapestry-progress", JSON.stringify(progressObj));
        }
        
        for (var id in progressObj) {
            var amountViewed = progressObj[id].progress;
            var amountUnviewed = 1.00 - amountViewed;
            var quizCompletionInfo = progressObj[id].quiz;
            var completed = progressObj[id].completed;
        
            var index = findNodeIndex(id);
            
            if (index !== -1) {
                var node = tapestry.dataset.nodes[index];
                const willLock = node.unlocked && !progressObj[id].unlocked
                if (willLock && !wpCanEditTapestry) {
                    node.quiz = []
                    node.typeData = {
                        progress: node.typeData.progress
                    }
                }
                
                node.unlocked = progressObj[id].unlocked;
                node.accessible = progressObj[id].accessible;

                if (wpUserId) {
                    node.conditions = progressObj[id].conditions;
            
                    const content = progressObj[id].content
                    if (content) {
                        node.quiz = content.quiz
                        node.typeData = content.typeData
                    }
                }

                if (node.mediaType !== "accordion" && tapestry.dataset.nodes[index].typeData.progress) {
                    //Update the dataset with new values

                    // Error prevention
					if (!node.typeData.progress) {
						node.typeData.progress = [ {'value': 0}, {'value': 1 } ];
                    }
                    
                    node.typeData.progress[0].value = amountViewed;
                    node.typeData.progress[1].value = amountUnviewed;

                    var questions = node.quiz;
                    if (quizCompletionInfo) {
                        Object.entries(quizCompletionInfo).forEach(([questionId, completionInfo]) => {
                            var question = questions.find(question => question.id === questionId);
                            if (question) {
                                question.completed = completionInfo.completed;
                                question.entries = {};
                                Object.entries(completionInfo).forEach(([key, value]) => {
                                    if (key !== "completed") {
                                        question.entries[key] = value;
                                    }
                                })
                            }
                        })
                    }
                    node.completed = completed;
                }
            }
        }
        return true;
    }
    this.setDatasetProgress = setDatasetProgress;
    
    /* For setting the "type" field of nodes in dataset */
    function setNodeTypes(rootId) {
    
        root = rootId;

        if (tapestryDepth) {
            var children = getChildren(root, tapestryDepth - 2),
                grandchildren = getChildren(root, tapestryDepth - 1);
        }
    
        for (var i in tapestry.dataset.nodes) {
            var node = tapestry.dataset.nodes[i];
            var id = node.id;

            if (id === root) {
                node.nodeType = "root";
            } else {
                //NOTE: If there are any nodes are that fit two roles (ie: selected and the grandchild),
                //      should default to being the more senior role
                // If a node is in the visible nodes list and a filter is active, 
                // always set it as a child
                if (!tapestryDepth || children.indexOf(id) > -1) {
                    node.nodeType = "child";
                } else if (grandchildren.indexOf(id) > -1) {
                    node.nodeType = "grandchild";
                } else {
                    node.nodeType = "";
                }
            }
            
        }
    }
    
    /* For setting the "type" field of links in dataset */
    function setLinkTypes(rootId) {

        root = rootId;

        if (tapestryDepth) {
            var children = getChildren(root, tapestryDepth - 2),
                grandchildren = getChildren(root, tapestryDepth - 1);
        }
    
        for (var i in tapestry.dataset.links) {
            var link = tapestry.dataset.links[i];
            var targetId = link.target.id;
    
            // If unlocked, set proper link type. Else, set it as "" to present that it shouldn't be shown
            var parentIndex = findNodeIndex(tapestry.dataset.links[i].source.id);
            if (tapestry.dataset.links[i].appearsAt && tapestry.dataset.links[i].appearsAt <= (tapestry.dataset.nodes[parentIndex].typeData.progress[0].value * tapestry.dataset.nodes[parentIndex].mediaDuration)) {
                if (targetId === root) {
                    link.type = "root";
                } else if (!tapestryDepth || children.indexOf(targetId) > -1) {
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
    
    // ALL the checks for whether a certain node is viewable
    function getViewable(node) {
        // CHECK 1: If the node is currently in view (ie: root/child/grandchild)
        if (node.nodeType === "") return false;

        // CHECK 2: If user can edit the tapestry
        if (config.wpCanEditTapestry) {
            return true;
        }
    
        // CHECK 3: If node is the root node or is currently selected
        if (node.nodeType === "root" || (node.id == tapestry.dataset.rootId && node.nodeType !== "")) return true;

        // CHECK 4: If node is an accordion row and user is not the author
        if (node.presentationStyle === "accordion-row" && !config.wpCanEditTapestry) return false;
    
        // If it passes all the checks, return true!
        return true;
    }
    
    function checkPermission(node, permissionType) {
        if (config.wpCanEditTapestry) {
            return true;
        }
        if (node.author.id == config.wpUserId) {
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