<template>
  <div class="menu-bar" aria-label="Tapestry Menu Bar">
    <b-container class="can-edit">
      <b-row align-v="center">
        <template v-if="isLoggedIn">
          <b-col class="p-0">
            <user-settings-button
              data-qa="user-settings-button"
            ></user-settings-button>
          </b-col>
          <template v-if="canEdit || (!showMap && hasDepth)">
            <b-col v-if="canEdit" class="p-0">
              <help-button />
            </b-col>
            <b-col v-if="canEdit && settings.submitNodesEnabled" class="p-0">
              <review-notifications />
            </b-col>
            <b-col v-if="canEdit" class="p-0">
              <settings-modal-button></settings-modal-button>
            </b-col>
          </template>
        </template>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapState } from "vuex"
import SettingsModalButton from "./SettingsModalButton"
import UserSettingsButton from "./UserSettingsButton"
import ReviewNotifications from "./ReviewNotifications"
import HelpButton from "./HelpButton"
import * as wp from "@/services/wp"

export default {
  components: {
    SettingsModalButton,
    ReviewNotifications,
    UserSettingsButton,
    HelpButton,
  },
  computed: {
    ...mapState(["settings"]),
    canEdit() {
      return wp.canEditTapestry()
    },
    hasDepth() {
      return this.maxLevel > 1 && this.settings.defaultDepth > 0
    },
    showMap() {
      return this.settings.renderMap
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
  },
  methods: {
    hideToolbar() {
      // TODO: if this is still needed, add the necessary CSS for hiding the toolbar
      return !(this.canEdit || (!this.showMap && this.hasDepth))
    },
  },
}
</script>

<style lang="scss">
.menu-bar {
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 5vw;
  transition: all 0.2s ease-out;

  button {
    color: var(--text-color-tertiary);
    padding: 0.5rem;
    background: none;
    font-size: 1.2em;
    transition: all 0.2s ease;

    &.active,
    &:hover {
      background: none;
      color: var(--highlight-color);
      transform: scale(1.1);
    }
  }

  .slider-wrapper {
    background: var(--bg-color-secondary);
    box-shadow: 0 0 7px 0 var(--bg-color-primary);
    display: flex;
    align-items: center;
    border-radius: 4px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    padding: 8px 6px 8px 12px;
    margin-left: auto;
    position: relative;

    button {
      color: var(--text-color-tertiary);
      &:hover {
        color: var(--highlight-color);
      }
    }
  }
}
</style>
