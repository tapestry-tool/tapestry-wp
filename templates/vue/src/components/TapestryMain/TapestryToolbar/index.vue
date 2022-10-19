<template>
  <div class="toolbar-wrapper" aria-label="Tapestry Toolbar">
    <div class="toolbar">
      <div class="tool-group">
        <tapestry-toolbar-button
          id="tapestry-pan-tool"
          :tool="tools.PAN"
          tooltip="Pan Tool"
        >
          <i class="fas fa-arrows-alt fa-lg"></i>
        </tapestry-toolbar-button>
        <tapestry-toolbar-button
          id="tapestry-select-tool"
          :tool="tools.SELECT"
          tooltip="Select Tool"
        >
          <i class="fas fa-mouse-pointer fa-lg"></i>
        </tapestry-toolbar-button>
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
          tooltip="Add Connection"
        >
          <i class="fas fa-arrows-alt-v fa-lg"></i>
        </tapestry-toolbar-button>
        <settings-modal-button></settings-modal-button>
      </div>
      <div class="separator"></div>
      <div class="tool-group">
        <tapestry-toolbar-button
          id="tapestry-undo-button"
          tooltip="Undo"
          @click="undo"
        >
          <i class="fas fa-undo fa-lg"></i>
        </tapestry-toolbar-button>
        <tapestry-toolbar-button
          id="tapestry-redo-button"
          tooltip="Redo"
          @click="redo"
        >
          <i class="fas fa-redo fa-lg"></i>
        </tapestry-toolbar-button>
      </div>
    </div>
  </div>
</template>

<script>
import TapestryToolbarButton from "../common/TapestryToolbarButton"
import SettingsModalButton from "./SettingsModalButton"
import { tools } from "@/utils/constants"
import { mapActions } from "vuex"

export default {
  components: {
    TapestryToolbarButton,
    SettingsModalButton,
  },
  data() {
    return {
      tools: tools,
    }
  },
  methods: {
    ...mapActions(["undo", "redo"]),
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

    background-color: #ededed;
    border: 2px solid #f8f8f8;
    border-radius: 9px;

    .tool-group {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;

      &:first-child > :first-child {
        border-top-left-radius: 9px;
        border-top-right-radius: 9px;
      }

      & > :first-child {
        padding-top: 4px;
      }

      &:last-child > :last-child {
        border-bottom-left-radius: 9px;
        border-bottom-right-radius: 9px;
      }

      & > :last-child {
        padding-bottom: 4px;
      }
    }

    .separator {
      height: 2px;
      background-color: #f8f8f8;
    }
  }
}
</style>
