<template>
  <tapestry-context-toolbar
    :show="show && hasEditPermission && !justChanged"
    :position="position"
    :offset="20"
    @set-show="handleShowHide"
  >
    <template v-if="node">
      <tapestry-toolbar-button
        :id="`delete-node-button-${node.id}`"
        class="after-separator before-separator"
        horizontal
        tooltip="Delete Node"
        :active="activeButton === 'delete'"
        @click="handleDeleteNode"
      >
        <i class="fas fa-trash-alt fa-lg"></i>
      </tapestry-toolbar-button>

      <div class="tapestry-toolbar-separator"></div>

      <template v-if="node.hideMedia">
        <tapestry-toolbar-button
          :id="`view-node-button-${node.id}`"
          class="after-separator before-separator"
          horizontal
          tooltip="View Node"
          @click="openModal(names.LIGHTBOX)"
        >
          <media-button-icon class="icon"></media-button-icon>
        </tapestry-toolbar-button>

        <div class="tapestry-toolbar-separator"></div>
      </template>

      <v-swatches
        :value="node.textColor"
        :swatches="swatchesWithTransparentColor"
        show-border
        show-fallback
        shapes="circles"
        swatch-size="30"
        :wrapper-style="{ zIndex: 1000 }"
        fallback-input-type="color"
        row-length="8"
        popover-x="right"
        class="swatch"
        @input="handleTextColorInput"
        @open="handleOpen('textColor')"
        @close="handleClose('textColor')"
      >
        <tapestry-toolbar-button
          :id="`title-color-button-${node.id}`"
          slot="trigger"
          class="after-separator"
          horizontal
          tooltip="Change Text Color"
          :active="activeButton === 'textColor'"
        >
          <div v-if="node.hideTitle" class="text-color-hidden-container">
            <i class="fas fa-font fa-lg"></i>
            <div class="slash"></div>
          </div>
          <div v-else class="text-color-icon-container">
            <i class="fas fa-font"></i>
            <div class="color-box" :style="{ background: node.textColor }"></div>
          </div>
        </tapestry-toolbar-button>
      </v-swatches>

      <node-background-button
        :node="node"
        :active="activeButton === 'background'"
        @show="handleOpen('background')"
        @hide="handleClose('background')"
      ></node-background-button>

      <div class="tapestry-toolbar-separator"></div>

      <div class="position-relative">
        <tapestry-toolbar-button
          :id="`change-level-button-${node.id}`"
          :tabindex="activeButton === 'level' ? -1 : 0"
          horizontal
          tooltip="Change Level"
          @click="handleToggle('level')"
        >
          <div class="circle level-circle">{{ node.level }}</div>
        </tapestry-toolbar-button>
        <node-level-select
          v-if="activeButton === 'level'"
          :node="node"
          @close="handleClose('level')"
        ></node-level-select>
      </div>

      <div class="tapestry-toolbar-separator"></div>

      <b-dropdown
        variant="none"
        no-caret
        toggle-class="more-actions-button after-separator before-separator"
        :toggle-attrs="{
          'aria-label': 'Other Node Actions',
          tabindex: -1,
        }"
        @show="handleOpen('moreActions')"
        @hide="handleClose('moreActions')"
      >
        <template #button-content>
          <tapestry-toolbar-button
            :id="`more-actions-button-${node.id}`"
            horizontal
            tooltip="Other Node Actions"
            :active="activeButton === 'moreActions'"
          >
            <i class="fas fa-ellipsis-h"></i>
          </tapestry-toolbar-button>
        </template>
        <b-dropdown-item-button @click="openModal(names.NODEPERMISSIONS)">
          Node Permissions
        </b-dropdown-item-button>
        <b-dropdown-item-button @click="openModal(names.NODELOCK)">
          Lock Node
        </b-dropdown-item-button>
      </b-dropdown>
    </template>
  </tapestry-context-toolbar>
</template>

<script>
import VSwatches from "vue-swatches"
import "vue-swatches/dist/vue-swatches.css"
import TapestryContextToolbar from "../TapestryContextToolbar"
import TapestryToolbarButton from "../common/TapestryToolbarButton"
import NodeLevelSelect from "./NodeLevelSelect"
import NodeBackgroundButton from "./NodeBackgroundButton"
import MediaButtonIcon from "./MediaButtonIcon"
import Helpers from "@/utils/Helpers"
import { tools, swatches } from "@/utils/constants"
import { mapActions, mapState } from "vuex"
import { names } from "@/config/routes"

export default {
  components: {
    TapestryContextToolbar,
    TapestryToolbarButton,
    NodeLevelSelect,
    NodeBackgroundButton,
    MediaButtonIcon,
    VSwatches,
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
    node: {
      type: Object,
      required: false,
      default: null,
    },
    position: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      tools: tools,
      swatches: swatches,
      names: names,

      activeButton: null,
      justChanged: false,
    }
  },
  computed: {
    ...mapState(["settings"]),
    hasEditPermission() {
      return this.node
        ? Helpers.hasPermission(this.node, "edit", this.settings.showRejected)
        : false
    },
    swatchesWithTransparentColor() {
      const swatches = [...this.swatches]
      swatches.splice(swatches.length - 1, 1, { color: "", label: "Transparent" })
      return swatches
    },
  },
  watch: {
    node(newNode, oldNode) {
      if (oldNode !== null && newNode?.id !== oldNode.id) {
        this.activeButton = null
        this.justChanged = true
        setTimeout(() => {
          this.justChanged = false
        }, 300) // allow time for toolbar hide transition to finish
      }
    },
  },
  methods: {
    ...mapActions(["updateNode", "deleteNode"]),
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
    handleDeleteNode() {
      this.activeButton = "delete"
      this.$bvModal
        .msgBoxConfirm(`Are you sure you want to delete ${this.node.title}?`, {
          modalClass: "node-modal-confirmation",
          title: "Are you sure you want to delete this node?",
          okTitle: "Yes, Delete!",
          okVariant: "danger",
        })
        .then(close => {
          if (close) {
            this.deleteNode(this.node.id)
          }
        })
        .catch(err => console.log(err))
        .finally(() => {
          this.handleClose("delete")
        })
    },
    openModal(name) {
      this.$router.push({
        name: name,
        params: { nodeId: this.node.id },
        query: this.$route.query,
      })
    },
    handleTextColorInput(textColor) {
      this.updateNode({
        id: this.node.id,
        newNode: {
          textColor: textColor,
          hideTitle: textColor === "",
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
/*
.before-separator {
  padding-right: 2px;
}

.after-separator {
  padding-left: 2px;
}
*/

.text-color-hidden-container {
  position: relative;
  color: #b2b2b2;
}

.slash {
  width: 2px;
  height: 40px;
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-45deg) translate(-2px, -4px);
  transform-origin: 0 0;
}

.text-color-icon-container {
  position: relative;
  width: 20px;
  margin-top: -5px;
}

.color-box {
  width: 20px;
  height: 5px;
  position: absolute;
}

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

.icon {
  max-width: 60%;
  max-height: 60%;
}
</style>

<style lang="scss">
.more-actions-button {
  padding: 0 !important; // Remove Bootstrap padding

  &:focus,
  &:hover {
    background: none;
    outline: none;
    box-shadow: none !important; // Remove Bootstrap focus outline
  }
}
</style>
