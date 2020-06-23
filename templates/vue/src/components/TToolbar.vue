<template>
  <div class="toolbar">
    <tapestry-filter></tapestry-filter>
    <t-settings-modal-button></t-settings-modal-button>
    <tapestry-depth-slider></tapestry-depth-slider>
  </div>
</template>

<script>
import TapestryDepthSlider from "@/components/TapestryDepthSlider"
import TapestryFilter from "@/components/TapestryFilter"
import TSettingsModalButton from "@/components/TSettingsModalButton"

export default {
  components: {
    TapestryDepthSlider,
    TapestryFilter,
    TSettingsModalButton,
  },
}
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
}
</style>
