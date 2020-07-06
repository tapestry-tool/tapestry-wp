<template>
  <div class="toolbar">
    <t-settings-modal-button></t-settings-modal-button>
    <tapestry-depth-slider></tapestry-depth-slider>
  </div>
</template>

<script>
import TapestryDepthSlider from "@/components/TapestryDepthSlider"
import TSettingsModalButton from "@/components/TSettingsModalButton"

export default {
  components: {
    TapestryDepthSlider,
    TSettingsModalButton,
  },
}
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
}
</style>
