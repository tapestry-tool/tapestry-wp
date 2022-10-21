<template>
  <b-popover
    :id="menuElementId"
    :target="target"
    :show="show"
    triggers=""
    :placement="placement"
    custom-class="popover-root"
    @hide="handleHide"
    @hidden="handleHidden"
  >
    <div class="tapestry-context-toolbar">
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
    placement: {
      type: String,
      required: false,
      default: "top",
    },
  },
  data() {
    return {
      tools: tools,
      show: false,
      keepOpen: false,
    }
  },
  computed: {
    menuElementId() {
      return `${this.target}-menu`
    },
  },
  watch: {
    show(show) {
      if (show) {
        this.$emit("show")
      } else {
        this.$emit("hide")
      }
    },
  },
  mounted() {
    this.$root.$on("bv::modal::show", () => {
      this.show = false
    })
    this.$root.$on("context-toolbar::dismiss", () => {
      this.show = false
    })
    this.$root.$on("context-toolbar::open", elementId => {
      if (elementId === this.target && !this.show) {
        this.show = true
      } else {
        this.show = false
      }
    })
  },
  methods: {
    handleHide() {
      if (!this.keepOpen) {
        this.keepOpen = this.show
      }
      this.show = false
    },
    handleHidden() {
      if (this.keepOpen) {
        this.show = true
      }
      this.keepOpen = false
    },
    // the following 2 methods are for other components to call
    toggleVisible() {
      this.show = !this.show
      return this.show
    },
    hide() {
      this.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.popover-root {
  background-color: #ededed;
  border: 2px solid #f8f8f8;
  border-radius: 9px;
  max-width: none !important;

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
  background-color: #f8f8f8;
}
.tapestry-context-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;

  &:first-child > :first-child {
    border-top-left-radius: 9px;
    border-bottom-left-radius: 9px;
  }

  &:last-child > :last-child {
    border-top-right-radius: 9px;
    border-bottom-right-radius: 9px;
  }
}
</style>
