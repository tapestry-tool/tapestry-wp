<template>
  <div :class="['wrapper', { open: state !== states.CLOSED }]">
    <button class="toggle" aria-label="Connections" @click="toggle">
      <span v-if="state === states.CLOSED">😊</span>
      <tapestry-icon v-else icon="chevron-down" />
    </button>
    <div class="content">
      <button
        v-if="state !== states.SEARCH && state !== states.ADD"
        class="content-control"
        aria-label="search"
        @click="state = states.SEARCH"
      >
        <tapestry-icon icon="search" />
      </button>
      <div v-if="state === states.SEARCH" class="searchbar">
        <label id="search-label" style="display: none;">
          Search for a connection
        </label>
        <button aria-label="close search" @click="state = states.OPEN">
          <tapestry-icon icon="times" />
        </button>
        <input v-model="search" aria-labelledby="search-label" type="text" />
      </div>
      <button
        v-if="state !== states.ADD"
        class="content-control"
        aria-label="add connection"
        @click="state = states.ADD"
      >
        <tapestry-icon icon="plus" />
      </button>
      <add-connection-form
        v-if="state === states.ADD"
        class="form"
        :communities="communities"
        @back="state = states.OPEN"
        @add-connection="addConnection"
      />
      <ul
        v-else
        :class="['connection-list', { searching: state === states.SEARCH }]"
      >
        <li
          v-for="connection in visibleConnections"
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
import { matchSorter } from "match-sorter"
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
      search: "",
    }
  },
  computed: {
    states() {
      return states
    },
    visibleConnections() {
      const populated = Object.values(this.connections).map(connection => ({
        ...connection,
        communities: this.getCommunities(connection.id),
      }))
      const matches = matchSorter(populated, this.search, { keys: ["name"] })
      return matches
    },
  },
  methods: {
    toggle() {
      this.state = this.state === states.CLOSED ? states.OPEN : states.CLOSED
    },
    addConnection(...args) {
      this.state = states.OPEN
      this.$emit("add-connection", ...args)
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
  padding: 0;
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
  display: grid;
  grid-template-columns: 12rem 1fr;
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  background: white;
  position: relative;
  z-index: 10;
  padding: 3rem;
  height: 100%;
  border-top: 1px solid var(--cos-color-tertiary);
}

.content-control {
  flex: 1;
  background: none;
  color: var(--cos-color-secondary);
  margin: 0;
  padding: 0;
  display: block;
  border-radius: 1rem;
  font-size: 6rem;
  grid-column: 1;

  &:hover {
    background: var(--cos-color-tertiary);
    color: white;
  }

  &[aria-label="search"] {
    grid-row: 1;
  }

  &[aria-label="add connection"] {
    grid-row: 2;
  }
}

.connection-list {
  width: 100%;
  overflow-x: scroll;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  grid-auto-rows: min-content;
  gap: 1rem;
  grid-row: 1 / -1;

  &.searching {
    grid-row: 2 / span 1;
  }
}

.searchbar {
  grid-column: 1 / -1;
  display: flex;
  column-gap: 1rem;

  button {
    width: 12rem;
    background: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6rem;
    border-radius: 1rem;
    color: var(--cos-color-secondary);

    &:hover {
      background: var(--cos-color-tertiary);
      color: white;
    }
  }

  input {
    flex: 1;
    font-size: 4rem;
    border-radius: 1rem;
    padding: 1rem 2rem;
  }
}

.connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  height: 12rem;

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

.form {
  width: 100%;
  grid-column: 1 / -1;
}

.debug {
  border: 3px solid black;
}
</style>
