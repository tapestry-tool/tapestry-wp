<template>
  <b-popover
    :target="nodeElementId"
    triggers=""
    :show="show"
    placement="top"
    custom-class="popover-root"
  >
    <div class="toolbar">
      <tapestry-toolbar-button
        :id="`add-node-tool-${node.id}`"
        horizontal
        icon="cog"
        :tool="tools.ADD_NODE"
        tooltip="Add Node"
      />
      <div class="separator"></div>
      <tapestry-toolbar-button
        :id="`delete-node-button-${node.id}`"
        horizontal
        icon="cog"
        tooltip="Delete Node"
      />
    </div>
  </b-popover>
</template>

<script>
import TapestryToolbarButton from "./common/TapestryToolbarButton"
import { tools } from "@/utils/constants"

export default {
  components: {
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
      show: false,
    }
  },
  computed: {
    nodeElementId() {
      return `tapestry-node-${this.node.id}`
    },
  },
  mounted() {
    this.$root.$on("bv::modal::show", () => {
      this.show = false
    })
    this.$root.$on("node-mousedown", () => {
      this.show = false
    })
    this.$root.$on("node-click", id => {
      if (id === this.node.id) {
        this.show = true
      } else {
        this.show = false
      }
    })
  },
}
</script>

<style lang="scss" scoped>
.popover-root {
  padding: 0 4px;
  background-color: var(--bg-color-secondary);
  border: 2px solid #fafafa;
  border-radius: 9px;

  .toolbar {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;

    .separator {
      width: 2px;
      background-color: #fafafa;
      margin: 0 4px;
    }
  }

  // override BootstrapVue popover styles
  ::v-deep .arrow {
    display: none;
  }
  ::v-deep .popover-body {
    padding: 0;
  }
}
</style>
