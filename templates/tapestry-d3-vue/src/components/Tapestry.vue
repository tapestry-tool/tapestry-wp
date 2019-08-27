<template>
  <div id="tapestry">
    <RootNodeButton v-show="!tapestry.rootId && !showNodeModal" @add-root-node="addRootNode" />
    <NodeModal
      v-if="showNodeModal"
      :node="currentNode"
      :modalType="modalType"
      @close-modal="closeModal"
      @tapestryAddNewNode="tapestryAddNewNode"
    />
  </div>
</template>

<script>
import Helpers from "../utils/Helpers"
import NodeModal from './NodeModal'
import RootNodeButton from './RootNodeButton'
import TapestryAPI from '../services/TapestryAPI'

export default {
  name: 'tapestry',
  components: {
    NodeModal,
    RootNodeButton
  },
  async mounted() {
    this.TapestryAPI = new TapestryAPI(wpPostId);
    this.tapestry = await this.TapestryAPI.getTapestry();
    thisTapestryTool.setDataset(this.tapestry);
    thisTapestryTool.setOriginalDataset(this.tapestry);
    thisTapestryTool.initialize();
    thisTapestryTool.redrawTapestryWithNewNode();

    // Set up event listeners to communicate with D3 elements
    window.addEventListener('change-root-node', this.changeRootNode)
    window.addEventListener('add-new-node', this.addNewNode)
    window.addEventListener('edit-node', this.editNode)
  },
  data() {
    return {
      tapestry: {},
      TapestryAPI: {},
      modalType: '',
      showNodeModal: false,
      currentNode: {}
    }
  },
  methods: {
    getCurrentRootNode() {
      if (this.tapestry && this.tapestry.nodes) {
        return this.tapestry.nodes.find(node => {
          return node.id === this.tapestry.rootId;
        });
      }
    },
    addRootNode() {
      debugger
      this.modalType = 'add-root-node';
      this.showNodeModal = true;
      this.$bvModal.show('node-modal-container');
    },
    addNewNode() {
      debugger
      this.modalType = 'add-new-node';
      this.currentNode = this.getCurrentRootNode();
      this.showNodeModal = true;
      this.$bvModal.show('node-modal-container');
    },
    editNode() {
      debugger
      this.modalType = 'edit-node';
      this.currentNode = this.getCurrentRootNode();
      this.showNodeModal = true;
      this.$bvModal.show('node-modal-container');
    },
    closeModal() {
      debugger
      this.showNodeModal = false;
      this.$bvModal.hide('node-modal-container');
    },
    changeRootNode(event) {
      debugger
      this.tapestry.rootId = event.detail;
    },
    async tapestryAddNewNode(formData, isEdit, isRoot) {
      const NORMAL_RADIUS = 140;
      const ROOT_RADIUS_DIFF = 70;
      let root = this.tapestry.rootId;

      if (typeof isRoot == 'undefined') {
        isRoot = false;
      }

      var errorMsg = tapestryValidateNewNode(formData, isRoot);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }

      // Add the node data first
      var newNodeEntry = {
        "type": "tapestry_node",
        "description": "",
        "status": "publish",
        "nodeType": "",
        "title": "",
        "imageURL": "",
        "mediaType": "",
        "mediaFormat": "",
        "mediaDuration": 0,
        "typeId": 1,
        "group": 1,
        "typeData": {
          "progress": [
            { "group": "viewed", "value": 0 },
            { "group": "unviewed", "value": 1 }
          ],
          "mediaURL": "",
          "mediaWidth": 960,      //TODO: This needs to be flexible with H5P	
          "mediaHeight": 600
        },
        "unlocked": true,
        "fx": Helpers.getBrowserWidth(),
        "fy": Helpers.getBrowserHeight()
      };

      // Node ID exists, so edit case
      if (isEdit) {
        newNodeEntry.fx = this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].fx;
        newNodeEntry.fy = this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].fy;
      } else {
        if (!isRoot) {
          // Just put the node right under the current node
          newNodeEntry.fx = this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].fx;
          newNodeEntry.fy = this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].fy + (NORMAL_RADIUS + ROOT_RADIUS_DIFF) * 2 + 50;
        }
      }

      var appearsAt = 0;
      for (var i = 0; i < formData.length; i++) {
        var fieldName = formData[i].name;
        var fieldValue = formData[i].value;

        switch (fieldName) {
          case "title":
            newNodeEntry[fieldName] = fieldValue;
            break;
          case "imageURL":
            newNodeEntry[fieldName] = fieldValue;
            break;
          case "mediaType":
            if (fieldValue === "text") {
              newNodeEntry[fieldName] = fieldValue;
              newNodeEntry.typeData.textContent = $("#tapestry-node-text-area").val();
            }
            else if (fieldValue === "video") {
              newNodeEntry["mediaType"] = "video";
              newNodeEntry["mediaFormat"] = "mp4";
            }
            else if (fieldValue === "h5p") {
              newNodeEntry["mediaType"] = "h5p";
              newNodeEntry["mediaFormat"] = "h5p";
            }
            break;
          case "mp4-mediaURL":
            if (fieldValue !== "") {
              newNodeEntry.typeData.mediaURL = fieldValue;
            }
            break;
          case "h5p-mediaURL":
            if (fieldValue !== "") {
              newNodeEntry.typeData.mediaURL = fieldValue;
            }
            break;
          case "mp4-mediaDuration":
            if (fieldValue !== "") {
              newNodeEntry.mediaDuration = parseInt(fieldValue);
            }
            break;
          case "h5p-mediaDuration":
            if (fieldValue !== "") {
              newNodeEntry.mediaDuration = parseInt(fieldValue);
            }
            break;
          case "unlocked":
            newNodeEntry.unlocked = fieldValue || isRoot;
            break;
          case "description":
            newNodeEntry.description = fieldValue;
            break;
          case "permissions":
            newNodeEntry.permissions = fieldValue;
            break;
          default:
            break;
        }
      }

      if (!isEdit) {
        const response = await this.TapestryAPI.addNode(JSON.stringify(newNodeEntry));
        const result = response.data;

        // Save to database, first save node then the link
        // only add link if it's for adding new node and not root node
        // Add new node to this.tapestry after getting the id
        newNodeEntry.id = result.id;
        this.tapestry.nodes.push(newNodeEntry);

        if (!isRoot) {
          // Get ID from callback and set it as target's id
          const newLink = { "source": root, "target": result.id, "value": 1, "type": "", "appearsAt": appearsAt };

          await this.TapestryAPI.addLink(JSON.stringify(newLink));

          // Add the new link to the this.tapestry
          this.tapestry.links.push(newLink);
        } else {
          const newId = result.id;

          await this.TapestryAPI.updatePermissions(newId, JSON.stringify(newNodeEntry.permissions));

          this.tapestry.rootId = newId;

          root = this.tapestry.rootId; // need to set root to newly created node

          $("#root-node-container").hide(); // hide the root node button after creating it.
        }
      } else {
        // Call endpoint for editing node
        const response = await this.TapestryAPI.updateNode(root, JSON.stringify(newNodeEntry));
        const result = response.data;

        newNodeEntry.id = result.id;

        this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)] = newNodeEntry;
      }

      tapestryHideAddNodeModal();

      thisTapestryTool.setDataset(this.tapestry);
      thisTapestryTool.redraw(isRoot);

      this.modalType = '';
      this.showNodeModal = false;
    }
  }
}
</script>

<style scoped>
</style>
