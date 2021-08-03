<template>
  <div class="toolbar">
    <tapestry-filter v-if="!showMap" style="z-index: 10" />
    <div
      v-show="isLoggedIn"
      :class="[{ 'hide-toolbar': hideToolbar }, 'slider-wrapper']"
    >
      <b-container class="can-edit">
        <b-row align-v="center">
          <b-col>
            <user-settings-button
              data-qa="user-settings-button"
            ></user-settings-button>
          </b-col>
          <template v-if="canEdit || (!showMap && hasDepth)">
            <b-col v-if="canEdit">
              <help-button />
            </b-col>
            <b-col v-if="canEdit && settings.submitNodesEnabled">
              <review-notifications />
            </b-col>
            <b-col v-if="canEdit">
              <settings-modal-button :max-depth="maxDepth"></settings-modal-button>
            </b-col>
          </template>
          <tapestry-depth-slider
            v-show="!showMap && hasDepth"
            @change="updateViewBox"
            @change:max-depth="maxDepth = $event"
          ></tapestry-depth-slider>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"
import TapestryDepthSlider from "./TapestryDepthSlider"
import SettingsModalButton from "./SettingsModalButton"
import UserSettingsButton from "./UserSettingsButton"
import TapestryFilter from "./TapestryFilter"
import ReviewNotifications from "./ReviewNotifications"
import HelpButton from "./HelpButton"
import * as wp from "@/services/wp"

export default {
  components: {
    TapestryDepthSlider,
    TapestryFilter,
    SettingsModalButton,
    ReviewNotifications,
    UserSettingsButton,
    HelpButton,
  },
  data() {
    return {
      maxDepth: 0,
    }
  },
  computed: {
    ...mapState(["nodes", "links", "selection", "settings", "rootId"]),
    canEdit() {
      return wp.canEditTapestry()
    },
    hasDepth() {
      return this.maxDepth > 1 && this.settings.defaultDepth > 0
    },
    showMap() {
      return this.settings.renderMap
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    updateViewBox() {
      this.$parent.updateViewBox()
    },
    getNodeDimensions() {
      this.$parent.getNodeDimensions()
    },
    hideToolbar() {
      return !(this.canEdit || (!this.showMap && this.hasDepth))
    },
  },
}
</script>

<style>
.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0 5vw;
  transition: all 0.2s ease-out;
}
.slider-wrapper {
  background: #fbfbfb;
  box-shadow: 0 0 7px 0 #ddd;
  display: flex;
  align-items: center;
  border-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  padding: 8px 6px 8px 12px;
  margin-left: auto;
  position: relative;
}
</style>
