<template>
  <div class="depth-slider">
    <input v-model="currentDepth" type="range" min="1" :max="maxDepth" />
    <p v-if="currentDepth < maxDepth">
      Some nodes might be hidden because you're not at max depth.
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDepth: 0,
    }
  },
  computed: {
    maxDepth() {
      return 4
    },
  },
  watch: {
    currentDepth: {
      immediate: true,
      handler: function() {
        // TODO: Update node visibility type here
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.depth-slider {
  position: absolute;
  right: 0;
  top: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>
