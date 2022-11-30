<template>
  <button
    :id="id"
    class="tapestry-toolbar-button"
    :class="{
      horizontal: horizontal,
      'not-available': disabled,
      selected: isSelected,
    }"
    @click="handleClick"
  >
    <div class="button-content">
      <slot></slot>
    </div>
    <b-tooltip
      :custom-class="`button-tooltip ${tooltipPlacementValue}`"
      :target="id"
      triggers="hover"
      :placement="tooltipPlacementValue"
    >
      {{ tooltip }} {{ tooltipSuffix }}
    </b-tooltip>
  </button>
</template>

<script>
import { tools, toolKeyBindings } from "@/utils/constants"
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
    tooltipPlacement: {
      type: String,
      required: false,
      default: null,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapState(["currentTool"]),
    isSelected() {
      return this.active || (this.currentTool && this.tool === this.currentTool)
    },
    tooltipPlacementValue() {
      return this.tooltipPlacement
        ? this.tooltipPlacement
        : this.horizontal
        ? "top"
        : "right"
    },
    tooltipSuffix() {
      return this.tool && toolKeyBindings[this.tool]
        ? `(${toolKeyBindings[this.tool]})`
        : ""
    },
  },
  methods: {
    ...mapMutations(["setCurrentTool"]),
    handleClick() {
      this.$emit("click")
      if (this.tool && this.tool !== this.currentTool) {
        this.setCurrentTool(this.tool)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tapestry-toolbar-button {
  color: var(--text-color-primary);
  padding: 0;
  background: none;
  font-size: 1.4em; // 2em larger than menubar buttons
  transition: all 0.2s ease;

  &.not-available {
    color: var(--border-color);
    cursor: default;
  }

  &.selected {
    background: var(--bg-color-primary);
  }

  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    transition: all 0.2s ease;
  }

  &.selected,
  &:not(.not-available):hover {
    .button-content {
      color: var(--highlight-color);
      transform: scale(1.1);
    }
  }
}

.button-tooltip {
  .top {
    top: -14px !important;
  }

  .bottom {
    top: 14px !important;
  }

  .right {
    left: 24px !important;
  }

  .left {
    left: -24px !important;
  }
}
</style>
