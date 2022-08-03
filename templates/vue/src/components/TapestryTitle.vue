<template>
  <div class="tapestry-title">
    {{ title }}
  </div>
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
  methods: {},
}
</script>

<style lang="scss" scoped>
.tapestry-title {
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px 0 0 5vw;
  height: 36px;
  line-height: 36px;
  font-size: 1.5rem;
}
</style>
