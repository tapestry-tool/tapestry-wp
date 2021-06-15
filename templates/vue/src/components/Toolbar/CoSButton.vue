<template>
  <button data-qa="CoS-button" class="cos-button" @click="open">
    <tapestry-icon icon="bullseye"></tapestry-icon>
    <b-modal></b-modal>
  </button>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
// import { names } from "@/config/routes"
import client from "@/services/TapestryAPI"

export default {
  components: {
    TapestryIcon,
  },
  computed: {
    isTest() {
      return Boolean(window.Cypress)
    },
    // settingsModalOpen: {
    //   get() {
    //     return this.$route.name === names.SETTINGS
    //   },
    //   set(open) {
    //     this.$router.push({
    //       name: open ? names.SETTINGS : names.APP,
    //       params: { nodeId: this.$route.params.nodeId, tab: "appearance" },
    //       query: this.$route.query,
    //     })
    //   },
    // },
    // tab() {
    //   return this.$route.params.tab
    // },
  },
  watch: {
    // tab: {
    //   immediate: true,
    //   handler(requestedTab) {
    //     if (this.settingsModalOpen) {
    //       const acceptedTabs = ["appearance", "advanced", "access"]
    //       if (!acceptedTabs.includes(requestedTab)) {
    //         this.$router.replace({
    //           name: names.SETTINGS,
    //           params: { nodeId: this.$route.params.nodeId, tab: "appearance" },
    //           query: this.$route.query,
    //         })
    //       }
    //     }
    //   },
    // },
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
    // changeTab(tab) {
    //   this.$router.push({
    //     name: names.SETTINGS,
    //     params: { nodeId: this.$route.params.nodeId, tab },
    //     query: this.$route.query,
    //   })
    // },
  },
}
</script>

<style lang="scss" scoped>
.cos-button,
.cos-button:focus {
  padding: 0.5rem;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;
}
</style>
