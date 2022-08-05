<template>
  <tapestry-context-toolbar :target="nodeElementId">
    <tapestry-toolbar-button
      :id="`add-node-tool-${node.id}`"
      horizontal
      icon="cog"
      :tool="tools.ADD_NODE"
      tooltip="Add Node"
    />
    <div class="tapestry-toolbar-separator"></div>
    <tapestry-toolbar-button
      :id="`delete-node-button-${node.id}`"
      horizontal
      icon="cog"
      tooltip="Delete Node"
    />
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
