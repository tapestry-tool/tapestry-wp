<template>
  <ul class="circle-container">
    <li
      v-for="(circle, index) in circlesWithData"
      :key="index"
      :style="{
        '--index': index,
        '--border-width': circle.borderWidth,
        '--order': circle.order,
      }"
      class="circle"
    ></li>
  </ul>
</template>

<script>
export default {
  props: {
    communities: {
      type: Object,
      required: true,
    },
    connections: {
      type: Object,
      required: true,
    },
    circles: {
      type: Array,
      required: true,
    },
  },
  computed: {
    circlesWithData() {
      return this.circles.map((connections, index) => {
        const order = this.circles.length - index
        const borderWidth = `${order}px`
        return { borderWidth, connections, order }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.circle-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  list-style: none;

  --startSize: calc(max(250px, 25vw));
  --offsetSize: calc(var(--startSize) * 0.75);
}

.circle {
  --radius: calc(var(--startSize) + var(--offsetSize) * var(--index));

  position: absolute;
  border: var(--border-width, 2px) solid var(--cos-color-secondary);
  width: var(--radius);
  height: var(--radius);
  border-radius: 50%;
  z-index: calc(var(--order) * 10);
}
</style>
