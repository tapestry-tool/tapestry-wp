<template>
  <button
    aria-label="Open Tapestry Settings"
    data-qa="settings-button"
    class="settings-button"
    @click="open"
  >
    <tapestry-icon icon="cog"></tapestry-icon>
    <settings-modal
      :show="settingsModalOpen"
      :tab="tab"
      @close="close"
      @change:tab="changeTab"
    ></settings-modal>
  </button>
</template>

<script>
import SettingsModal from "@/components/modals/SettingsModal"
import TapestryIcon from "@/components/common/TapestryIcon"
import { names } from "@/config/routes"
import client from "@/services/TapestryAPI"

export default {
  components: {
    SettingsModal,
    TapestryIcon,
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

<style lang="scss" scoped>
.settings-button:only-child {
  margin-right: 12px;
}
</style>
