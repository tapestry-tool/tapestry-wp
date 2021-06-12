<template>
  <cos-modal show>
    <b-container class="modal-container">
      <b-row align-h="center" class="py-2">
        <b-col
          v-for="connection in threeConnections()"
          :key="connection.id"
          align-self="center"
          class="ob-connection-box"
        >
          <p class="ob-connection">{{ connection.name }}</p>
          <h1>{{ connection.avatar }}</h1>
        </b-col>
      </b-row>
      <b-row align-h="center" class="py-2">
        <h3 style="max-width:150px;">
          Great job! Here are some of
          your connections.
        </h3>
      </b-row>
      <b-row align-h="center" class="py-2">
        <h5 class="ob-secondary">
          You'll be able to edit and add more at any time.
        </h5>
      </b-row>
      <b-row align-h="center" class="py-2">
        <b-col v-if="visibleConnections.length >= 4" class="ob-connection-box">
          <p class="ob-connection">
            {{  visibleConnections[3].name}}
          </p>
          <h1>
            {{ visibleConnections[3].avatar }}
          </h1>
        </b-col>
        <b-col v-else class="ob-connection-box">
        </b-col>
        <b-col align-self="center">
          <b-button
            pill
            variant="secondary"
            class="secondary"
            @click="$emit('ob-finish')"
          >
            Connection &#8594;
          </b-button>
        </b-col>
        <b-col v-show="visibleConnections.length == 5" class="ob-connection-box">
          <p class="ob-connection">
            {{ (visibleConnections[4] && visibleConnections[4].name) || "" }}
          </p>
          <h1>
            {{ (visibleConnections[4] && visibleConnections[4].avatar) || "" }}
          </h1>
        </b-col>
      </b-row>
    </b-container>
  </cos-modal>
</template>

<script>
import CosModal from "../CosModal"

export default {
  components: {
    CosModal,
  },
  props: {
    connections: {
      require: true,
    },
  },
  computed: {
    visibleConnections() {
      let connectionsArray = Object.values(this.connections)
      return connectionsArray.slice(0, Math.min(connectionsArray.length, 5))
    },
  },
  methods: {
    threeConnections() {
      return this.visibleConnections.slice(0, 3)
    },
  },
}
</script>

<style scoped>
.modal-container {
  width: 50vw;
  min-width: 300px;
  max-width: 750px;
}
</style>
