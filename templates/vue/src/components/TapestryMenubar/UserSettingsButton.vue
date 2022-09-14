<template>
  <button aria-label="Open User Settings" class="menubar-button" @click="open">
    <span class="fas fa-user fa-s"></span>
    <user-settings-modal
      :show="themeFormOpen"
      :tab="tab"
      @close="close"
      @change:tab="changeTab"
    ></user-settings-modal>
  </button>
</template>

<script>
import client from "@/services/TapestryAPI"
import { names } from "@/config/routes"
import UserSettingsModal from "../modals/UserSettingsModal"
export default {
  components: {
    UserSettingsModal,
  },
  computed: {
    themeFormOpen: {
      get() {
        return this.$route.name === names.USERSETTINGS
      },
      set(open) {
        this.$router.push({
          name: open ? names.USERSETTINGS : names.APP,
          params: { nodeId: this.$route.params.nodeId, tab: "theme" },
          query: this.$route.query,
        })
      },
    },
    tab() {
      return this.$route.params.tab
    },
  },
  watch: {
    tab: {
      immediate: true,
      handler(requestedTab) {
        if (this.settingsModalOpen) {
          const acceptedTabs = ["theme", "developer"]
          if (!acceptedTabs.includes(requestedTab)) {
            this.$router.replace({
              name: names.USERSETTINGS,
              params: { nodeId: this.$route.params.nodeId, tab: "theme" },
              query: this.$route.query,
            })
          }
        }
      },
    },
  },
  methods: {
    open() {
      this.themeFormOpen = true
      client.recordAnalyticsEvent("user", "open", "user-settings")
    },
    close() {
      this.themeFormOpen = false
      client.recordAnalyticsEvent("user", "close", "user-settings")
    },
    changeTab(tab) {
      this.$router.push({
        name: names.USERSETTINGS,
        params: { nodeId: this.$route.params.nodeId, tab },
        query: this.$route.query,
      })
    },
  },
}
</script>
