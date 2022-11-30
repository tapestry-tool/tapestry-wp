<template>
  <tapestry-context-toolbar
    :show="show && hasEditPermission && !justChanged"
    :position="position"
    :offset="20"
    @set-show="handleShowHide"
  >
    <tapestry-toolbar-button
      id="delete-nodes-button"
      class="after-separator before-separator"
      horizontal
      tooltip="Delete Nodes"
      :active="activeButton === 'delete'"
      @click="handleDeleteNodes"
    >
      <i class="fas fa-trash-alt fa-lg"></i>
    </tapestry-toolbar-button>

    <div class="tapestry-toolbar-separator"></div>

    <div class="position-relative">
      <tapestry-toolbar-button
        id="change-levels-button"
        :tabindex="activeButton === 'level' ? -1 : 0"
        horizontal
        tooltip="Change Levels"
        @click="handleToggle('level')"
      >
        <div class="circle level-circle">{{ level === null ? "--" : level }}</div>
      </tapestry-toolbar-button>
      <nodes-level-select
        v-if="activeButton === 'level'"
        :level="level"
        @change-levels="handleChangeLevels"
        @close="handleClose('level')"
      ></nodes-level-select>
    </div>
  </tapestry-context-toolbar>
</template>

<script>
import TapestryContextToolbar from "../TapestryContextToolbar"
import TapestryToolbarButton from "../common/TapestryToolbarButton"
import NodesLevelSelect from "./NodesLevelSelect"
import Helpers from "@/utils/Helpers"
import { mapActions, mapGetters, mapState } from "vuex"

export default {
  components: {
    TapestryContextToolbar,
    TapestryToolbarButton,
    NodesLevelSelect,
  },
  model: {
    prop: "show",
    event: "set-show",
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    position: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      activeButton: null,
      justChanged: false,
    }
  },
  computed: {
    ...mapState(["settings", "selection"]),
    ...mapGetters(["getNode"]),
    nodes() {
      return this.selection.map(id => this.getNode(id))
    },
    level() {
      if (this.nodes.length === 0) {
        return null
      }
      const level = this.nodes[0].level
      return this.nodes.every(node => node.level === level) ? level : null
    },
    hasEditPermission() {
      return this.nodes.every(node =>
        Helpers.hasPermission(node, "edit", this.settings.showRejected)
      )
    },
  },
  watch: {
    selection(newSelection, oldSelection) {
      if (oldSelection.length !== 0 && newSelection.length !== 0) {
        this.activeButton = null
        this.justChanged = true
        setTimeout(() => {
          this.justChanged = false
        }, 300) // allow time for toolbar hide transition to finish
      }
    },
  },
  methods: {
    ...mapActions(["batchUpdateNodes", "deleteNode"]),
    handleShowHide(show) {
      if (show !== this.show) {
        this.$emit("set-show", show)
        if (!show) {
          this.activeButton = null
        }
      }
    },
    handleOpen(button) {
      this.activeButton = button
    },
    handleClose(button) {
      if (this.activeButton === button) {
        this.activeButton = null
      }
    },
    handleToggle(button) {
      if (this.activeButton === button) {
        this.activeButton = null
      } else {
        this.activeButton = button
      }
    },
    handleDeleteNodes() {
      this.activeButton = "delete"
      this.$bvModal
        .msgBoxConfirm(
          `Are you sure you want to delete the following nodes: ${this.nodes
            .map(node => node.title)
            .join(", ")}?`,
          {
            modalClass: "node-modal-confirmation",
            title: `Are you sure you want to delete ${this.nodes.length} nodes?`,
            okTitle: "Yes, Delete!",
            okVariant: "danger",
          }
        )
        .then(async close => {
          if (close) {
            // TODO: delete all nodes in one request (and allow restoring them all at once via Undo)
            for (const node of this.nodes) {
              await this.deleteNode(node.id)
            }
          }
        })
        .catch(err => console.log(err))
        .finally(() => {
          this.handleClose("delete")
        })
    },
    handleChangeLevels(diff) {
      const updates = []
      for (const node of this.nodes) {
        if (node.level + diff < 1) {
          continue
        }
        updates.push({
          id: node.id,
          newNode: {
            level: node.level + diff,
          },
        })
      }
      this.batchUpdateNodes(updates)
    },
  },
}
</script>

<style lang="scss" scoped>
.circle {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.level-circle {
  background-color: var(--tapestry-light-blue);
  color: #ffffff;
  font-size: 0.8rem;
  line-height: 1.5rem;
}

.position-relative {
  position: relative;
}
</style>
