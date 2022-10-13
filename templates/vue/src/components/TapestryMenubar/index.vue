<template>
  <div v-if="isLoggedIn" class="tapestry-menubar" aria-label="Tapestry Menubar">
    <b-container class="can-edit">
      <b-row align-v="center">
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
          <b-col v-if="isAdmin" class="p-0">
            <user-answers-button data-qa="user-answers-button"></user-answers-button>
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
import UserAnswersButton from "./UserAnswersButton"
import UserSettingsButton from "./UserSettingsButton"
import ReviewNotifications from "./ReviewNotifications"
import HelpButton from "./HelpButton"
import OperationsButton from "./OperationsButton"
import * as wp from "@/services/wp"

export default {
  components: {
    ReviewNotifications,
    UserSettingsButton,
    HelpButton,
    OperationsButton,
    UserAnswersButton,
  },
  computed: {
    ...mapState(["settings"]),
    canEdit() {
      return wp.canEditTapestry()
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    isAdmin() {
      const currentUser = wp.getCurrentUser()
      return currentUser.roles && currentUser.roles.includes("administrator")
    },
  },
}
</script>

<style lang="scss">
.tapestry-menubar {
  position: absolute;
  top: 0;
  right: 0;
  padding-top: 1vh;
  padding-right: 5vw;
  transition: all 0.2s ease-out;

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
}
</style>
