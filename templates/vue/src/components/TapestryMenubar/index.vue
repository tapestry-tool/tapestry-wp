<template>
  <div class="tapestry-menubar" aria-label="Tapestry Menubar">
    <tapestry-filter
      v-if="!settings.renderMap && !isEmptyTapestry"
      class="menubar-group"
      style="z-index: 10"
    />
    <b-container v-if="isLoggedIn && (canEdit || !isEmptyTapestry)">
      <b-row align-v="center" class="menubar-group">
        <template v-if="!isEmptyTapestry">
          <b-col class="p-0">
            <user-settings-button
              data-qa="user-settings-button"
            ></user-settings-button>
          </b-col>
          <b-col class="p-0">
            <embed-button data-qa="embed-modal-button"></embed-button>
          </b-col>
        </template>
        <b-col v-if="isAuthoringEnabled" class="p-0">
          <help-button />
        </b-col>
        <template v-if="canEdit && !isEmptyTapestry">
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
import { mapGetters, mapState } from "vuex"
import UserSettingsButton from "./UserSettingsButton"
import ReviewNotifications from "./ReviewNotifications"
import HelpButton from "./HelpButton"
import EmbedButton from "./EmbedButton"
import OperationsButton from "./OperationsButton"
import TapestryFilter from "./TapestryFilter"
import * as wp from "@/services/wp"

export default {
  components: {
    ReviewNotifications,
    UserSettingsButton,
    HelpButton,
    EmbedButton,
    OperationsButton,
    TapestryFilter,
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["isEmptyTapestry", "isAuthoringEnabled"]),
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
    color: var(--text-color-primary);
    padding: 0;
    background: none;
    font-size: 1.2em;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;

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
    padding: 0 5px;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    border: 2px solid var(--border-color);
  }
}
</style>
