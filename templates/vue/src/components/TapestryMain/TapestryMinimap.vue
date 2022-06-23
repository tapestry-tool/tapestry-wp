<template>
  <div class="tapestry-minimap">View Box: {{ viewBox }}</div>
</template>

<script>
export default {
  name: "tapestry-minimap",
  props: {
    viewBox: {
      type: Array,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
  },
  computed: {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.tapestry-minimap {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 200px;
  background: gray;
}
</style>
