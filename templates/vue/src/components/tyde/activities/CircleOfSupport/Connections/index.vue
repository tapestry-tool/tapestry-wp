<template>
  <div :class="['wrapper', { open: state !== states.CLOSED }]">
    <button class="toggle" aria-label="Connections" @click="toggle">
      <span v-if="state === states.CLOSED">😊</span>
      <tapestry-icon v-else icon="chevron-down" />
    </button>
    <div v-show="state !== states.CLOSED" class="content">
      <div v-if="state === states.OPEN" class="controls">
        <button
          class="content-control"
          aria-label="search"
          @click="state = states.SEARCH"
        >
          <tapestry-icon icon="search" />
        </button>
        <button class="content-control" aria-label="add" @click="state = states.ADD">
          <tapestry-icon icon="plus" />
        </button>
      </div>
      <add-connection-form
        v-if="state === states.ADD"
        class="form"
        :communities="communities"
        @back="state = states.OPEN"
        @add-connection="addConnection"
      />
      <ul v-else class="connection-list">
        <li
          v-for="connection in populatedConnections"
          :key="connection.id"
          class="connection"
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
      </ul>
    </div>
  </div>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
import AddConnectionForm from "./AddConnectionForm"

const states = {
  CLOSED: 0,
  OPEN: 1,
  SEARCH: 2,
  ADD: 3,
}

export default {
  components: {
    AddConnectionForm,
    TapestryIcon,
  },
  props: {
    connections: {
      type: Object,
      required: true,
    },
    communities: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      state: states.CLOSED,
    }
  },
  computed: {
    states() {
      return states
    },
    populatedConnections() {
      return Object.values(this.connections).map(connection => ({
        ...connection,
        communities: this.getCommunities(connection.id),
      }))
    },
  },
  methods: {
    toggle() {
      this.state = this.state === states.CLOSED ? states.OPEN : states.CLOSED
    },
    addConnection(evt) {
      this.state = states.OPEN
      this.$emit("add-connection", evt)
    },
    getCommunities(connectionId) {
      return Object.values(this.communities).filter(community =>
        community.connections.includes(connectionId)
      )
    },
  },
}
</script>

<style scoped lang="scss">
ul {
  list-style: none;
  margin: 0;
}

.controls {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  font-size: 6rem;
  width: 12rem;
}

.content-control {
  flex: 1;
  background: none;
  color: var(--cos-color-secondary);
  margin: 0;
  padding: 0;
  display: block;
  border-radius: 1rem;

  &:hover {
    background: var(--cos-color-tertiary);
    color: white;
  }
}

.connection-list {
  width: 100%;
  overflow-x: scroll;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-auto-columns: 10rem;
  gap: 1rem;
}

.connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;

  p {
    padding: 0.25rem;
    border: 1px solid var(--cos-color-tertiary);
    color: var(--cos-color-secondary);
    text-transform: uppercase;
  }

  h1 {
    font-size: 4rem;
  }
}

.community-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    background-color: var(--community-color);
  }
}

.toggle {
  --size: 5rem;

  width: var(--size);
  height: var(--size);
  background: var(--cos-color-tertiary);
  position: absolute;
  left: 2rem;
  top: calc(-1 * var(--size));
  border-top-left-radius: var(--size);
  border-top-right-radius: var(--size);
  font-size: 2.5rem;
  transform: translateY(20%);
  z-index: 0;
}

.wrapper {
  height: 80%;
  z-index: 0;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;

  &.open {
    transform: translateY(0);
  }
}

.content {
  display: flex;
  background: white;
  position: relative;
  z-index: 10;
  padding: 3rem;
  height: 100%;
  border-top: 1px solid var(--cos-color-tertiary);
}

.form {
  width: 100%;
}

.debug {
  border: 3px solid black;
}
</style>
