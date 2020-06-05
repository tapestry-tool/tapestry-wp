<template>
  <div>
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
