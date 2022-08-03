<template>
  <div class="toolbar-wrapper" aria-label="Tapestry Toolbar">
    <div class="toolbar toolbar-top">
      <tapestry-toolbar-button
        id="tapestry-add-node-tool"
        icon="cog"
        :tool="tools.ADD_NODE"
        :tooltip="'Add a node'"
      />
      <tapestry-toolbar-button
        id="tapestry-add-link-tool"
        icon="cog"
        :tool="tools.ADD_LINK"
        :tooltip="'Add a link'"
      />
      <tapestry-toolbar-button
        id="tapestry-select-tool"
        icon="cog"
        :tool="tools.SELECT"
        :tooltip="'Select'"
      />
      <tapestry-toolbar-button
        id="tapestry-pan-tool"
        icon="cog"
        :tool="tools.PAN"
        :tooltip="'Pan'"
      />
    </div>
    <div class="toolbar toolbar-bottom">
      <tapestry-toolbar-button
        id="tapestry-undo-button"
        icon="cog"
        :tooltip="'Undo'"
      />
      <tapestry-toolbar-button
        id="tapestry-redo-button"
        icon="cog"
        :tooltip="'Redo'"
      />
    </div>
  </div>
</template>

<script>
import TapestryToolbarButton from "./TapestryToolbarButton"
import { tools } from "@/utils/constants"
import { mapMutations, mapState } from "vuex"
import DragSelectModular from "@/utils/dragSelectModular"

export default {
  components: {
    TapestryToolbarButton,
  },
  data() {
    return {
      tools: tools,
    }
  },
  computed: {
    ...mapState(["currentTool"]),
  },
  watch: {
    currentTool(newTool) {
      if (newTool === tools.SELECT) {
        DragSelectModular.addDragSelectListener()
      } else {
        DragSelectModular.removeDragSelectListener()
      }
    },
  },
  mounted() {
    this.$root.$on("bv::modal::show", () => {
      this.setCurrentTool(null)
    })
    this.$root.$on("bv::modal::hide", () => {
      this.setCurrentTool(null)
    })
  },
  methods: {
    ...mapMutations(["setCurrentTool"]),
  },
}
</script>

<style lang="scss" scoped>
.toolbar-wrapper {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .toolbar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-color-secondary);
    border: 2px solid #fafafa;
    row-gap: 8px;

    &.toolbar-top {
      padding: 24px 0 20px;
      border-radius: 8.58974px 8.58974px 0px 0px;
    }

    &.toolbar-bottom {
      padding: 18px 0;
      border-radius: 0px 0px 8.58974px 8.58974px;
    }
  }
}
</style>
