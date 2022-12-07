<template>
  <div
    v-if="isAuthoringEnabled"
    class="toolbar-wrapper"
    aria-label="Tapestry Toolbar"
  >
    <div class="toolbar">
      <div class="tool-group">
        <tapestry-toolbar-button
          id="tapestry-pan-tool"
          :tool="tools.PAN"
          tooltip="Pan Tool"
        >
          <i class="fas fa-arrows-alt"></i>
        </tapestry-toolbar-button>
        <tapestry-toolbar-button
          id="tapestry-select-tool"
          :tool="tools.SELECT"
          tooltip="Select Tool"
        >
          <i class="fas fa-mouse-pointer"></i>
        </tapestry-toolbar-button>
        <tapestry-toolbar-button
          v-if="canAddNode"
          id="tapestry-add-node-tool"
          :tool="tools.ADD_NODE"
          tooltip="Add Node"
        >
          <i class="fas fa-plus-circle"></i>
        </tapestry-toolbar-button>
        <tapestry-toolbar-button
          id="tapestry-add-link-tool"
          :tool="tools.ADD_LINK"
          tooltip="Add Connection"
        >
          <i class="fas fa-arrows-alt-v"></i>
        </tapestry-toolbar-button>
        <settings-modal-button v-if="canEdit"></settings-modal-button>
      </div>
      <div class="separator"></div>
      <div class="tool-group">
        <tapestry-toolbar-button
          id="tapestry-undo-button"
          :tooltip="undoTooltip"
          :disabled="!canUndo"
          @click="performUndo"
        >
          <i class="fas fa-undo"></i>
        </tapestry-toolbar-button>
        <tapestry-toolbar-button
          id="tapestry-redo-button"
          :tooltip="redoTooltip"
          :disabled="!canRedo"
          @click="performRedo"
        >
          <i class="fas fa-redo"></i>
        </tapestry-toolbar-button>
      </div>
    </div>
  </div>
</template>

<script>
import TapestryToolbarButton from "../common/TapestryToolbarButton"
import SettingsModalButton from "./SettingsModalButton"
import { tools } from "@/utils/constants"
import { mapActions, mapGetters, mapState } from "vuex"
import * as wp from "@/services/wp"
import Helpers from "@/utils/Helpers"

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
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["canUndo", "canRedo", "isAuthoringEnabled"]),
    platform() {
      return window.navigator.platform?.toLowerCase().indexOf("mac") !== -1
        ? "mac"
        : "windows"
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    canEdit() {
      return wp.canEditTapestry()
    },
    canAddNode() {
      if (!this.isLoggedIn) {
        return false
      }
      return (
        Helpers.hasPermission(null, "add", this.settings.showRejected) ||
        this.settings.draftNodesEnabled
      )
    },
    undoTooltip() {
      return `Undo (${this.platform === "mac" ? "Cmd" : "Ctrl"} + Z)`
    },
    redoTooltip() {
      return `Redo (Shift + ${this.platform === "mac" ? "Cmd" : "Ctrl"} + Z)`
    },
  },
  methods: {
    ...mapActions(["undo", "redo"]),
    performUndo() {
      this.undo().then(this.showToast)
    },
    performRedo() {
      this.redo().then(this.showToast)
    },
    showToast(message) {
      if (message) {
        this.$bvToast.toast(message, {
          noCloseButton: true,
          autoHideDelay: 3000,
          variant: "secondary",
          solid: true,
          toaster: "b-toaster-bottom-center",
          bodyClass: "tapestry-toast-body",
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.toolbar-wrapper {
  position: absolute;
  top: 0;
  left: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .toolbar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;

    background-color: var(--bg-color-secondary);
    border: 2px solid var(--border-color);
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
      background-color: var(--border-color);
    }
  }
}
</style>
