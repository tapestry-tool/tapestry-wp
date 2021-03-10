<template>
  <li
    ref="connection"
    class="connection"
    :style="{ opacity: isDragging ? 0.2 : 1 }"
    @click="$emit('click')"
  >
    <p>{{ connection.name }}</p>
    <h1>{{ connection.avatar }}</h1>
    <ul class="community-list">
      <li
        v-for="community in connection.communities"
        :key="community.id"
        :style="`--community-color: ${community.color}`"
      ></li>
    </ul>
  </li>
</template>

<script>
import * as d3 from "d3"

export default {
  props: {
    connection: {
      type: Object,
      required: true,
    },
    draggable: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isDragging: false,
    }
  },
  mounted() {
    if (this.draggable) {
      const connectionRef = this.$refs.connection
      d3.select(connectionRef).call(
        d3
          .drag()
          .container(document.getElementById("cos"))
          .on("start", () => {
            this.isDragging = true
            this.$emit("drag:start", {
              x: d3.event.x,
              y: d3.event.y,
              connection: this.connection,
            })
          })
          .on("drag", () => {
            this.$emit("drag:move", {
              x: d3.event.x,
              y: d3.event.y,
              connection: this.connection,
            })
          })
          .on("end", () => {
            this.isDragging = false
            this.$emit("drag:end", {
              x: d3.event.x,
              y: d3.event.y,
              connection: this.connection,
            })
          })
      )
    }
  },
}
</script>

<style lang="scss" scoped>
.connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  height: 12rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transform: translate(var(--x), var(--y));

  p {
    padding: 0.25rem;
    border: 1px solid var(--cos-color-tertiary);
    color: var(--cos-color-secondary);
    text-transform: uppercase;
    cursor: default;
  }

  h1 {
    font-size: 4rem;
    cursor: default;
  }

  &:hover {
    background: #f0f0f0;
  }
}

.community-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  column-gap: 4px;

  li {
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    background-color: var(--community-color, var(--cos-color-secondary));
  }
}
</style>
