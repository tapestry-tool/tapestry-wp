<template>
  <main>
    <tapestry-svg />
    <tapestry-depth-slider />
  </main>
</template>

<script>
import TapestrySvg from "@/components/TapestrySvg"
import TapestryDepthSlider from "@/components/TapestryDepthSlider"

export default {
  components: {
    TapestrySvg,
    TapestryDepthSlider,
  },
}
</script>

<style lang="scss" scoped>
main {
  position: relative;
}
</style>
