<template>
  <cos-popup :show="isOpen">
    <template #toggle>
      <cos-popup-button
        style="left: 2rem"
        aria-label="Connections"
        @click="isOpen = !isOpen"
      >
        <tapestry-icon v-if="isOpen" icon="chevron-down" />
        <span v-else>😊</span>
      </cos-popup-button>
    </template>
    <template #content>
      <add-connection-form
        v-if="state === states.ADD"
        class="form"
        :communities="communities"
        @back="state = states.OPEN"
        @add-connection="addConnection"
        @add-community="$emit('add-community', $event)"
      />
      <div v-else class="content">
        <div class="controls">
          <div class="search">
            <button
              class="content-control"
              aria-label="search"
              @click="toggleSearch"
            >
              <tapestry-icon icon="search" />
            </button>
            <div v-if="state === states.SEARCH" class="searchbar">
              <label id="search-label" style="display: none;">
                Search for a connection
              </label>
              <input v-model="search" aria-labelledby="search-label" type="text" />
            </div>
          </div>
          <button
            class="content-control"
            aria-label="add connection"
            @click="state = states.ADD"
          >
            <tapestry-icon icon="plus" />
          </button>
        </div>
        <ul :class="['connection-list', { searching: state === states.SEARCH }]">
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
    </template>
  </cos-popup>
</template>

<script>
import { matchSorter } from "match-sorter"
import TapestryIcon from "@/components/common/TapestryIcon"

import AddConnectionForm from "./AddConnectionForm"
import CosPopup from "../CosPopup"
import CosPopupButton from "../CosPopupButton"

const states = {
  CLOSED: 0,
  OPEN: 1,
  SEARCH: 2,
  ADD: 3,
}

export default {
  components: {
    AddConnectionForm,
    CosPopup,
    CosPopupButton,
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
      isOpen: false,
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
    toggleSearch() {
      this.state = this.state === states.SEARCH ? states.OPEN : states.SEARCH
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

.search {
  display: flex;
}

.content {
  height: 100%;
  display: flex;
  overflow: hidden;
  flex: 1;
}

.controls {
  position: absolute;
  left: 2rem;
  top: 2rem;
}

.content-control {
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cos-color-secondary);
  margin: 0;
  padding: 0;
  border-radius: 1rem;
  font-size: 3rem;
  background: white;

  &:hover {
    background: var(--cos-color-tertiary);
    color: white;
  }
}

.connection-list {
  width: 100%;
  overflow-y: scroll;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  grid-auto-rows: min-content;
  margin-left: 7rem;
  height: 100%;

  &.searching {
    margin-top: 7rem;
    height: calc(100% - 7rem);
  }
}

.searchbar {
  display: flex;
  align-items: center;
  margin-left: 1rem;

  input {
    border-radius: 0.5rem;
    width: 100%;
    height: 5rem;
    font-size: 2rem;
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
    cursor: default;
  }

  h1 {
    font-size: 4rem;
    cursor: default;
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
    background-color: var(--community-color);
  }
}

.form {
  width: 100%;
  height: 100%;
}

.debug {
  border: 3px solid black;
}
</style>
