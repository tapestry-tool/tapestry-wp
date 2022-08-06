<template>
  <div>
    <button
      :id="id"
      :class="[
        'tapestry-toolbar-button',
        'm-2',
        {
          selected: isSelected,
        },
      ]"
      @click="handleClick"
    >
      <slot></slot>
    </button>
    <b-tooltip
      :custom-class="horizontal ? 'offset-bottom' : 'offset-left'"
      :target="id"
      triggers="hover"
      :placement="horizontal ? 'top' : 'right'"
    >
      {{ tooltip }}
    </b-tooltip>
  </div>
</template>

<script>
import { tools } from "@/utils/constants"
import { mapMutations, mapState } from "vuex"

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: false,
      default: "",
    },
    tool: {
      required: false,
      default: null,
      validator: val => val === null || Object.values(tools).includes(val),
    },
    tooltip: {
      type: String,
      required: true,
    },
    horizontal: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapState(["currentTool"]),
    isSelected() {
      return this.currentTool && this.tool === this.currentTool
    },
  },
  methods: {
    ...mapMutations(["setCurrentTool"]),
    handleClick() {
      this.$emit("click")
      if (this.tool) {
        this.toggleTool()
      }
    },
    toggleTool() {
      if (this.tool === this.currentTool) {
        this.setCurrentTool(null)
      } else {
        this.setCurrentTool(this.tool)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tapestry-toolbar-button {
  color: var(--text-color-tertiary);
  padding: 0;
  background: none;
  font-size: 1.2em;
  transition: all 0.2s ease;

  &.selected {
    color: var(--highlight-color);
  }
}

.offset-left {
  left: 24px !important;
}

.offset-bottom {
  top: -12px !important;
}
</style>
