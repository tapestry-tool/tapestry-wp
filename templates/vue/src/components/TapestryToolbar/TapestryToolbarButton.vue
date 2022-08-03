<template>
  <div>
    <button
      :id="id"
      :class="{ 'tapestry-toolbar-button': true, selected: isSelected }"
      @click="toggleTool"
    >
      <tapestry-icon :icon="icon"></tapestry-icon>
    </button>
    <b-tooltip :target="id" triggers="hover" placement="right">
      {{ tooltip }}
    </b-tooltip>
  </div>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
import { tools } from "@/utils/constants"
import { mapMutations, mapState } from "vuex"

export default {
  components: {
    TapestryIcon,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
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
  },
  computed: {
    ...mapState(["currentTool"]),
    isSelected() {
      return this.currentTool && this.tool === this.currentTool
    },
  },
  methods: {
    ...mapMutations(["setCurrentTool"]),
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
  padding: 0 18px;
  background: none;
  font-size: 1.2em;
  transition: all 0.2s ease;

  &.selected {
    color: var(--highlight-color);
  }
}
</style>
