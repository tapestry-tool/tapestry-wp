<template>
  <button aria-label="create embed" @click="open">
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

<style lang="scss" scoped>
button {
  padding: 0.5rem;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;

  &.active,
  &:hover {
    background: none;
    color: var(--highlight-color);
    transform: scale(1.1);
  }
}
</style>
