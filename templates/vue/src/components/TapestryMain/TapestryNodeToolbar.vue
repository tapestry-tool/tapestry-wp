<template>
  <tapestry-context-toolbar :target="nodeElementId">
    <tapestry-toolbar-button
      :id="`delete-node-button-${node.id}`"
      horizontal
      tooltip="Delete Node"
    >
      <i class="fas fa-trash-alt fa-lg"></i>
    </tapestry-toolbar-button>
    <div class="tapestry-toolbar-separator"></div>
    <tapestry-toolbar-button
      :id="`hide-title-button-${node.id}`"
      horizontal
      :tooltip="node.hideTitle ? 'Show Title' : 'Hide Title'"
      @click="toggleHideTitle"
    >
      <div
        class="hide-title-text"
        :class="{
          'hide-title': node.hideTitle,
        }"
      >
        Title
        <div v-if="node.hideTitle" class="slash"></div>
      </div>
    </tapestry-toolbar-button>
  </tapestry-context-toolbar>
</template>

<script>
import TapestryContextToolbar from "./TapestryContextToolbar"
import TapestryToolbarButton from "./common/TapestryToolbarButton"
import Helpers from "@/utils/Helpers"
import { tools } from "@/utils/constants"
import { mapActions } from "vuex"

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
  methods: {
    ...mapActions(["updateNode"]),
    toggleHideTitle() {
      this.updateNode({
        id: this.node.id,
        newNode: {
          hideTitle: !this.node.hideTitle,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.hide-title-text {
  position: relative;

  &.hide-title {
    color: #b2b2b2;
  }
}

.slash {
  width: 2px;
  height: 3rem;
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-70deg) translate(-6px, -4px);
  transform-origin: 0 0;
}
</style>
