<template>
  <button aria-label="create embed" class="menubar-button" @click="open">
    <tapestry-icon icon="code" />
    <embed-modal :show="embedModalOpen" @close="close"></embed-modal>
  </button>
</template>

<script>
import EmbedModal from "@/components/modals/EmbedModal"
import TapestryIcon from "@/components/common/TapestryIcon"
import { names } from "@/config/routes"
import client from "@/services/TapestryAPI"

export default {
  components: {
    EmbedModal,
    TapestryIcon,
  },
  computed: {
    embedModalOpen: {
      get() {
        return this.$route.name === names.EMBED
      },
      set(open) {
        this.$router.push({
          name: open ? names.EMBED : names.APP,
          params: { nodeId: this.$route.params.nodeId },
          query: this.$route.query,
        })
      },
    },
  },
  methods: {
    open() {
      this.embedModalOpen = true
      client.recordAnalyticsEvent("user", "open", "embed")
    },
    close() {
      this.embedModalOpen = false
      client.recordAnalyticsEvent("user", "close", "embed")
    },
  },
}
</script>
