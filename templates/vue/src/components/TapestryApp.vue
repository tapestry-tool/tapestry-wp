<template>
  <main>
    <tapestry-svg></tapestry-svg>
    <t-toolbar v-if="tapestryIsLoaded"></t-toolbar>
  </main>
</template>

<script>
import { mapState } from "vuex"
import TapestrySvg from "@/components/TapestrySvg"
import TToolbar from "@/components/TToolbar"

export default {
  components: {
    TapestrySvg,
    TToolbar,
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
