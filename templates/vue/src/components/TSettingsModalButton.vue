<template>
  <button @click="settingsModalOpen = true">
    <tapestry-icon icon="cog"></tapestry-icon>
    <settings-modal
      :show="settingsModalOpen"
      @close="settingsModalOpen = false"
    ></settings-modal>
  </button>
</template>

<script>
import SettingsModal from "@/components/SettingsModal"
import TapestryIcon from "@/components/TapestryIcon"

export default {
  components: {
    SettingsModal,
    TapestryIcon,
  },
  data() {
    return {
      settingsModalOpen: false,
    }
  },
}
</script>
