<template>
  <div class="wrapper">
    <button class="toggle" aria-label="Connections" @click="toggle">
      <span v-if="state === states.CLOSED">😊</span>
      <tapestry-icon v-else icon="chevron-down" />
    </button>
    <div v-show="state !== states.CLOSED" class="content">
      <div v-if="state === states.OPEN">
        <button @click="state = states.SEARCH">Search</button>
        <button @click="state = states.ADD">Add</button>
      </div>
      <add-connection-form
        v-if="state === states.ADD"
        class="form"
        :communities="communities"
        @back="state = states.OPEN"
        @add-connection="$emit('add-connection', $event)"
      />
      <ul v-else>
        <li v-for="connection in connections" :key="connection.id">
          <h1>{{ connection.avatar }}</h1>
          <p>{{ connection.name }}</p>
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
  },
  methods: {
    toggle() {
      this.state = this.state === states.CLOSED ? states.OPEN : states.CLOSED
    },
  },
}
</script>

<style scoped lang="scss">
ul {
  list-style: none;
  margin: 0;
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
</style>
