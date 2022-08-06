<template>
  <tapestry-context-toolbar :target="nodeElementId">
    <tapestry-toolbar-button
      :id="`add-node-tool-${node.id}`"
      horizontal
      :tool="tools.ADD_NODE"
      tooltip="Add Node"
    >
      <i class="fas fa-plus-circle fa-lg"></i>
    </tapestry-toolbar-button>
    <div class="tapestry-toolbar-separator"></div>
    <tapestry-toolbar-button
      :id="`delete-node-button-${node.id}`"
      horizontal
      tooltip="Delete Node"
    >
      <i class="fas fa-trash-alt fa-lg"></i>
    </tapestry-toolbar-button>
  </tapestry-context-toolbar>
</template>

<script>
import TapestryContextToolbar from "./TapestryContextToolbar"
import TapestryToolbarButton from "./common/TapestryToolbarButton"
import Helpers from "@/utils/Helpers"
import { tools } from "@/utils/constants"

export default {
  components: {
    TapestryContextToolbar,
    TapestryToolbarButton,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tools: tools,
    }
  },
  computed: {
    nodeElementId() {
      return Helpers.getNodeElementId(this.node.id)
    },
  },
}
</script>
