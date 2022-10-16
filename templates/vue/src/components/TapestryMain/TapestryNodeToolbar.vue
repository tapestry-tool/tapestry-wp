<template>
  <tapestry-context-toolbar :target="nodeElementId" @hide="resetActiveButton">
    <tapestry-toolbar-button
      :id="`delete-node-button-${node.id}`"
      class="after-separator before-separator"
      horizontal
      tooltip="Delete Node"
      @click="handleDeleteNode"
    >
      <i class="fas fa-trash-alt fa-lg"></i>
    </tapestry-toolbar-button>

    <div class="tapestry-toolbar-separator"></div>

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
        class="after-separator before-separator"
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

    <div class="tapestry-toolbar-separator"></div>

    <tapestry-toolbar-button
      :id="`background-button-${node.id}`"
      class="after-separator before-separator"
      horizontal
      tooltip="Change Background"
      :active="activeButton === 'background'"
      @click="toggleBackgroundToolbar"
    >
      <i v-if="node.imageURL" class="fas fa-image fa-lg"></i>
      <div v-else class="circle" :style="{ background: node.backgroundColor }"></div>
    </tapestry-toolbar-button>
    <tapestry-context-toolbar
      ref="backgroundToolbar"
      :target="`background-button-${node.id}`"
      placement="bottom"
    >
      <tapestry-toolbar-button
        :id="`background-image-button-${node.id}`"
        horizontal
        tooltip="Change Background Image"
        tooltip-placement="bottom"
        :active="activeBackgroundButton === 'image'"
      >
        <i class="fas fa-image fa-lg"></i>
      </tapestry-toolbar-button>
      <v-swatches
        :value="node.backgroundColor"
        :swatches="swatches"
        show-fallback
        show-border
        shapes="circles"
        swatch-size="30"
        :wrapper-style="{ zIndex: 1000 }"
        fallback-input-type="color"
        row-length="8"
        popover-x="right"
        popover-y="top"
        class="swatch"
        @input="setField('backgroundColor', $event)"
        @open="activeBackgroundButton = 'color'"
        @close="handleBackgroundClose('color')"
      >
        <tapestry-toolbar-button
          :id="`background-color-button-${node.id}`"
          slot="trigger"
          class="before-separator"
          horizontal
          tooltip="Change Background Color"
          tooltip-placement="bottom"
          :active="activeBackgroundButton === 'color'"
        >
          <div class="circle" :style="{ background: node.backgroundColor }"></div>
        </tapestry-toolbar-button>
      </v-swatches>
    </tapestry-context-toolbar>

    <div class="tapestry-toolbar-separator"></div>

    <b-dropdown
      variant="none"
      no-caret
      toggle-class="more-actions-button after-separator before-separator"
      :toggle-attrs="{
        'aria-label': 'Other Node Actions',
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
  </tapestry-context-toolbar>
</template>

<script>
import VSwatches from "vue-swatches"
import "vue-swatches/dist/vue-swatches.css"
import TapestryContextToolbar from "./TapestryContextToolbar"
import TapestryToolbarButton from "./common/TapestryToolbarButton"
import Helpers from "@/utils/Helpers"
import { tools, swatches } from "@/utils/constants"
import { mapActions } from "vuex"
import { names } from "@/config/routes"

export default {
  components: {
    TapestryContextToolbar,
    TapestryToolbarButton,
    VSwatches,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tools: tools,
      swatches: swatches,
      names: names,

      activeButton: null,
      activeBackgroundButton: null,
    }
  },
  computed: {
    nodeElementId() {
      return Helpers.getNodeElementId(this.node.id)
    },
    swatchesWithTransparentColor() {
      const swatches = [...this.swatches]
      swatches.splice(swatches.length - 1, 1, { color: "", label: "Transparent" })
      return swatches
    },
  },
  methods: {
    ...mapActions(["updateNode", "deleteNode"]),
    hidePopupToolbars() {
      this.$refs.backgroundToolbar.hide()
    },
    setField(field, value) {
      this.hidePopupToolbars()
      this.updateNode({
        id: this.node.id,
        newNode: {
          [field]: value,
        },
      })
    },
    toggleBackgroundToolbar() {
      const isVisible = this.$refs.backgroundToolbar.toggleVisible()
      if (isVisible) {
        this.activeButton = "background"
      } else if (this.activeButton === "background") {
        this.activeButton = null
      }
    },
    resetActiveButton() {
      this.activeButton = null
      this.activeBackgroundButton = null
    },
    handleOpen(button) {
      this.activeButton = button
      this.hidePopupToolbars()
    },
    handleClose(button) {
      if (this.activeButton === button) {
        this.activeButton = null
      }
    },
    handleBackgroundClose(button) {
      if (this.activeBackgroundButton === button) {
        this.activeBackgroundButton = null
      }
    },
    handleDeleteNode() {
      this.hidePopupToolbars()
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
.before-separator {
  padding-right: 4px;
}

.after-separator {
  padding-left: 4px;
}

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
