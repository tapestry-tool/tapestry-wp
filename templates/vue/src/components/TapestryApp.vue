<template>
  <main>
    <tapestry-svg />
    <tapestry-depth-slider v-if="tapestryIsLoaded" />
  </main>
</template>

<script>
import { mapState } from "vuex"
import TapestrySvg from "@/components/TapestrySvg"
import TapestryDepthSlider from "@/components/TapestryDepthSlider"

export default {
  components: {
    TapestrySvg,
    TapestryDepthSlider,
  },
  computed: {
    ...mapState(["tapestryIsLoaded"]),
  },
}
</script>

<style lang="scss" scoped>
main {
  position: relative;
}
</style>
