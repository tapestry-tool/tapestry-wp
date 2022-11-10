<template>
  <h1 class="tapestry-title">{{ title }}</h1>
</template>

<script>
import { mapState } from "vuex"

export default {
  computed: {
    ...mapState(["settings"]),
    title() {
      return this.settings.title
    },
  },
}
</script>

<style lang="scss" scoped>
.tapestry-title {
  position: absolute;
  top: 1%;
  left: 5%;
  height: 56px;
  line-height: 56px;
  display: flex;
  font-size: 1.5rem;
  font-weight: normal;
  margin: 0;
}
</style>
