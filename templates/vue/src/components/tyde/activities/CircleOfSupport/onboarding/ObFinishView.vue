<template>
  <cos-modal show>
    <b-container class="modal-container">
      <b-row align-h="center">
        <b-col
          v-for="connection in threeConnections()"
          :key="connection.id"
          align-self="center"
          class="ob-connection-box"
        >
          <p class="ob-connection">{{ connection.name }}</p>
          <span style="font-size:2.5rem;">{{ connection.avatar }}</span>
        </b-col>
      </b-row>
      <b-row align-h="center">
        <h3 style="max-width:350px;">
          Great job! Here are some of your connections.
        </h3>
      </b-row>
      <b-row align-h="center">
        <h5 class="ob-secondary">
          You'll be able to edit and add more at any time.
        </h5>
      </b-row>
      <b-row align-h="center">
        <b-col v-if="visibleConnections.length >= 4" class="ob-connection-box">
          <p class="ob-connection">
            {{ visibleConnections[3].name }}
          </p>
          <span style="font-size:2.5rem;">
            {{ visibleConnections[3].avatar }}
          </span>
        </b-col>
        <b-col v-else class="ob-connection-box"></b-col>
        <b-col>
          <b-button
            v-if="circleViewEnabled"
            pill
            variant="secondary"
            class="secondary mx-2"
            @click="$emit('continue')"
          >
            Continue &#8594;
          </b-button>
          <b-button
            v-else
            pill
            variant="secondary"
            class="secondary mx-2"
            @click="$emit('done')"
          >
            Done
          </b-button>
        </b-col>
        <b-col v-if="visibleConnections.length == 5" class="ob-connection-box">
          <p class="ob-connection">
            {{ visibleConnections[4].name }}
          </p>
          <span style="font-size:2.5rem;">
            {{ visibleConnections[4].avatar }}
          </span>
        </b-col>
        <b-col v-else class="ob-connection-box"></b-col>
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
      type: Object,
      required: true,
    },
    circleViewEnabled: {
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
  max-width: 650px;
}
.row {
  padding: 10px 0;
}
</style>
