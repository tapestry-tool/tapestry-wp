<template>
  <button class="filter"><i class="fas fa-search"></i></button>
</template>

<script>
export default {
  name: "tapestry-filter",
  computed: {
    isActive() {
      return this.$route.path.includes("filter")
    },
  },
}
</script>

<style lang="scss" scoped>
.filter {
  position: absolute;
  top: -60px;
  left: 10vw;
}
</style>
