<template>
  <div class="tapestry-menubar" aria-label="Tapestry Menubar">
    <tapestry-filter
      v-if="!settings.renderMap"
      class="menubar-group"
      style="z-index: 10"
    />
    <b-container v-if="isLoggedIn">
      <b-row align-v="center" class="menubar-group">
        <b-col class="p-0">
          <user-settings-button
            data-qa="user-settings-button"
          ></user-settings-button>
        </b-col>
        <template v-if="canEdit">
          <b-col class="p-0">
            <help-button />
          </b-col>
          <b-col v-if="settings.submitNodesEnabled" class="p-0">
            <review-notifications />
          </b-col>
          <b-col class="p-0">
            <operations-button />
          </b-col>
        </template>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapState } from "vuex"
import UserSettingsButton from "./UserSettingsButton"
import ReviewNotifications from "./ReviewNotifications"
import HelpButton from "./HelpButton"
import OperationsButton from "./OperationsButton"
import TapestryFilter from "./TapestryFilter"
import * as wp from "@/services/wp"

export default {
  components: {
    ReviewNotifications,
    UserSettingsButton,
    HelpButton,
    OperationsButton,
    TapestryFilter,
  },
  computed: {
    ...mapState(["settings"]),
    canEdit() {
      return wp.canEditTapestry()
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
  },
}
</script>

<style lang="scss">
.tapestry-menubar {
  position: absolute;
  top: 1%;
  right: 5%;
  height: 56px;
  transition: all 0.2s ease-out;
  display: flex;
  flex-wrap: nowrap;

  button.menubar-button {
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

  .menubar-group {
    height: 56px;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 0 0.5rem;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
  }
}
</style>
