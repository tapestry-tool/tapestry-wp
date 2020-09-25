<template>
  <button class="settings-button" @click="settingsModalOpen = true">
    <tapestry-icon icon="cog"></tapestry-icon>
    <settings-modal
      :show="settingsModalOpen"
      :tab="tab"
      @close="settingsModalOpen = false"
      @change:tab="changeTab"
    ></settings-modal>
  </button>
</template>

<script>
import SettingsModal from "@/components/SettingsModal"
import TapestryIcon from "@/components/TapestryIcon"
import { names } from "@/config/routes"

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
.settings-button,
.settings-button:focus {
  padding: 0;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;
}

.settings-button:hover {
  background: none;
  color: #11a6d8;
  transform: scale(1.1);
}

.settings-button:only-child {
  margin-right: 12px;
}
</style>
