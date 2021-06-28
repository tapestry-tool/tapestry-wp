<template>
  <button data-qa="user-settings" class="user-settings-button" @click="open">
    <tapestry-icon icon="user"></tapestry-icon>
    <user-settings-modal :show="avatarFormOpen" :tab="Avatar"></user-settings-modal>
  </button>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
import client from "@/services/TapestryAPI"
import { names } from "@/config/routes"
import UserSettingsModal from "../modals/UserSettingsModal"

export default {
  components: {
    UserSettingsModal,
    TapestryIcon,
  },
  computed: {
    avatarFormOpen: {
      get() {
        return this.$route.name === names.USERSETTINGS
      },
      set(open) {
        this.$router.push({
          name: open ? names.USERSETTINGS : names.APP,
          params: { nodeId: this.$route.params.nodeId, tab: "avatar" },
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
          const acceptedTabs = ["avatar"]
          if (!acceptedTabs.includes(requestedTab)) {
            this.$router.replace({
              name: names.USERSETTINGS,
              params: { nodeId: this.$route.params.nodeId, tab: "avatar" },
              query: this.$route.query,
            })
          }
        }
      },
    },
  },
  methods: {
    open() {
      console.log("Is open")
      this.avatarFormOpen = true
      client.recordAnalyticsEvent("user", "open", "user-settings")
    },
    close() {
      console.log("Is close")
      this.avatarFormOpen = false
      client.recordAnalyticsEvent("user", "close", "user-settings")
    },
  },
}
</script>

<style lang="scss" scoped>
.user-settings-button,
.user-settings-button:focus {
  padding: 0.5rem;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;
}

.user-settings-button:hover {
  background: none;
  color: #11a6d8;
  transform: scale(1.1);
}

.user-settings-button:only-child {
  margin-right: 12px;
}
</style>
