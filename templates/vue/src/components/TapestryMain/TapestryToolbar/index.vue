<template>
  <div class="toolbar-wrapper" aria-label="Tapestry Toolbar">
    <div class="toolbar">
      <tapestry-toolbar-button
        id="tapestry-add-node-tool"
        :tool="tools.ADD_NODE"
        tooltip="Add Node"
      >
        <i class="fas fa-plus-circle fa-lg"></i>
      </tapestry-toolbar-button>
      <tapestry-toolbar-button
        id="tapestry-add-link-tool"
        :tool="tools.ADD_LINK"
        tooltip="Make Connection"
      >
        <i class="fas fa-arrows-alt-v fa-lg"></i>
      </tapestry-toolbar-button>
      <tapestry-toolbar-button
        id="tapestry-select-tool"
        :tool="tools.SELECT"
        tooltip="Selection Tool"
      >
        <i class="fas fa-mouse-pointer fa-lg"></i>
      </tapestry-toolbar-button>
      <tapestry-toolbar-button
        id="tapestry-pan-tool"
        :tool="tools.PAN"
        tooltip="Pan Tool"
      >
        <i class="fas fa-arrows-alt fa-lg"></i>
      </tapestry-toolbar-button>
      <tapestry-toolbar-button id="tapestry-settings-button" tooltip="Settings">
        <i class="fas fa-cog fa-lg"></i>
      </tapestry-toolbar-button>
      <div class="separator"></div>
      <tapestry-toolbar-button id="tapestry-undo-button" tooltip="Undo">
        <i class="fas fa-undo fa-lg"></i>
      </tapestry-toolbar-button>
      <tapestry-toolbar-button id="tapestry-redo-button" tooltip="Redo">
        <i class="fas fa-redo fa-lg"></i>
      </tapestry-toolbar-button>
    </div>
  </div>
</template>

<script>
import TapestryToolbarButton from "../common/TapestryToolbarButton"
import { tools } from "@/utils/constants"

export default {
  components: {
    TapestryToolbarButton,
  },
  data() {
    return {
      tools: tools,
    }
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
    align-items: stretch;
    padding: 12px 0;
    width: 60px;
    row-gap: 6px;

    background-color: var(--bg-color-secondary);
    border: 2px solid #fafafa;
    border-radius: 9px;

    .separator {
      height: 2px;
      background-color: #fafafa;
      margin: 5px 0;
    }
  }
}
</style>
