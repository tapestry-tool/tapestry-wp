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
    >
      <ul>
        <li v-for="connection in circle.connections" :key="connection.id">
          {{ connection.avatar }}
        </li>
      </ul>
    </li>
    <div class="controls">
      <p>Circle: {{ activeCircle }}</p>
      <button @click="activeCircle++">+</button>
      <button @click="activeCircle--">-</button>
      <button @click="addConnection">Add connection</button>
      <button @click="removeConnection">Remove connection</button>
    </div>
  </ul>
</template>

<script>
import Helpers from "@/utils/Helpers"

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
  },
  // STUB: Change this to props
  data() {
    return {
      circles: [[], [], []],
      activeCircle: 0,
    }
  },
  computed: {
    circlesWithData() {
      return this.circles.map((connections, index) => {
        const order = this.circles.length - index
        const borderWidth = `${order}px`
        return {
          borderWidth,
          connections,
          order,
        }
      })
    },
  },
  methods: {
    addConnection() {
      const connection = {
        id: Helpers.createUUID(),
        name: "nan",
        avatar: "😀",
        communities: ["603e883568aae", "603e884ee69c1"],
      }
      this.circles[this.activeCircle].push(connection)
    },
    removeConnection() {
      this.circles[this.activeCircle].pop()
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

.controls {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
}

button {
  display: block;
  width: 100%;
  font-size: 0.8em;
}
</style>
