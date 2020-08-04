<template>
  <button class="settings-button" @click="settingsModalOpen = true">
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
