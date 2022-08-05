<template>
  <div class="toolbar-wrapper" aria-label="Tapestry Toolbar">
    <div class="toolbar">
      <tapestry-toolbar-button
        id="tapestry-add-node-tool"
        icon="cog"
        :tool="tools.ADD_NODE"
        tooltip="Add Node"
      />
      <tapestry-toolbar-button
        id="tapestry-add-link-tool"
        icon="cog"
        :tool="tools.ADD_LINK"
        tooltip="Make Connection"
      />
      <tapestry-toolbar-button
        id="tapestry-select-tool"
        icon="cog"
        :tool="tools.SELECT"
        tooltip="Selection Tool"
      />
      <tapestry-toolbar-button
        id="tapestry-pan-tool"
        icon="cog"
        :tool="tools.PAN"
        tooltip="Pan Tool"
      />
      <tapestry-toolbar-button
        id="tapestry-settings-button"
        icon="cog"
        tooltip="Settings"
      />
      <div class="separator"></div>
      <tapestry-toolbar-button id="tapestry-undo-button" icon="cog" tooltip="Undo" />
      <tapestry-toolbar-button id="tapestry-redo-button" icon="cog" tooltip="Redo" />
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
