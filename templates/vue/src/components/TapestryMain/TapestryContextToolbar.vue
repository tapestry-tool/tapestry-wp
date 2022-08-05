<template>
  <b-popover
    :id="menuElementId"
    :target="target"
    :show="show"
    triggers=""
    placement="top"
    custom-class="popover-root"
  >
    <div class="toolbar">
      <slot></slot>
    </div>
  </b-popover>
</template>

<script>
import { tools } from "@/utils/constants"

export default {
  props: {
    target: {
      type: String,
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
    menuElementId() {
      return `${this.target}-menu`
    },
  },
  mounted() {
    this.$root.$on("bv::modal::show", () => {
      this.show = false
    })
    this.$root.$on("node-mousedown", () => {
      // Handle node drag
      this.show = false
    })
    // TODO: dismiss menu if the user clicks outside the menu
    this.$root.$on("context-menu::click", elementId => {
      if (elementId === this.target && !this.show) {
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

<style lang="scss">
.tapestry-toolbar-separator {
  width: 2px;
  background-color: #fafafa;
  margin: 0 4px;
}
</style>
