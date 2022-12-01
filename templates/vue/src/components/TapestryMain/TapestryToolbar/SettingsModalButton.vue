<template>
  <tapestry-toolbar-button
    id="tapestry-settings-button"
    aria-label="Open Tapestry Settings"
    tooltip="Settings"
    data-qa="settings-button"
    @click="open"
  >
    <i class="fas fa-cog"></i>
    <settings-modal
      :show="settingsModalOpen"
      :tab="tab"
      @close="close"
      @change:tab="changeTab"
    ></settings-modal>
  </tapestry-toolbar-button>
</template>

<script>
import SettingsModal from "@/components/modals/SettingsModal"
import TapestryToolbarButton from "../common/TapestryToolbarButton"
import { names } from "@/config/routes"
import client from "@/services/TapestryAPI"

export default {
  components: {
    SettingsModal,
    TapestryToolbarButton,
  },
  computed: {
    settingsModalOpen: {
      get() {
        return this.$route.name === names.SETTINGS
      },
      set(open) {
        this.$router.push({
          name: open ? names.SETTINGS : names.APP,
          params: { nodeId: this.$route.params.nodeId, tab: "appearance" },
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
          const acceptedTabs = ["appearance", "advanced", "access"]
          if (!acceptedTabs.includes(requestedTab)) {
            this.$router.replace({
              name: names.SETTINGS,
              params: { nodeId: this.$route.params.nodeId, tab: "appearance" },
              query: this.$route.query,
            })
          }
        }
      },
    },
  },
  methods: {
    open() {
      this.settingsModalOpen = true
      client.recordAnalyticsEvent("user", "open", "settings")
    },
    close() {
      this.settingsModalOpen = false
      client.recordAnalyticsEvent("user", "close", "settings")
    },
    changeTab(tab) {
      this.$router.push({
        name: names.SETTINGS,
        params: { nodeId: this.$route.params.nodeId, tab },
        query: this.$route.query,
      })
    },
  },
}
</script>
