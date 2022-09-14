<template>
  <button class="user-settings-button" @click="open">
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
          const acceptedTabs = ["theme"]
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

<style lang="scss" scoped>
.user-settings-button,
.user-settings-button:focus {
  padding: 0.5rem;
  background: none;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;
}
.user-settings-button:hover {
  background: none;
  color: var(--highlight-color);
  transform: scale(1.1);
}
</style>
