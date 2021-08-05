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
          Awesome! Here are all your connections so far.
        </h3>
      </b-row>
      <b-row align-h="center">
        <b-row align-h="center" class="py-2">
          <h4 class="ob-secondary">
            Would you like to continue adding more connections?
          </h4>
        </b-row>
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
      <b-row>
        <b-container>
          <b-row class="controls py-2">
            <b-col>
              <b-button
                pill
                variant="secondary"
                class="secondary"
                @click="$emit('later')"
              >
                I'm done &#8594;
              </b-button>
            </b-col>
            <b-col>
              <b-button
                pill
                variant="secondary"
                class="primary"
                @click="$emit('another')"
              >
                Keep adding &#8594;
              </b-button>
            </b-col>
          </b-row>
        </b-container>
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
  max-width: 650px;
}
.row {
  padding: 10px 0;
}
</style>
