<template>
  <cos-modal show>
    <b-container class="modal-container">
      <b-row align-h="center">
        <h3 style="max-width:350px;">
          Nicely done!
        </h3>
      </b-row>
      <b-row align-h="center">
        <b-row align-h="center" class="py-2">
          <h4 class="ob-secondary px-4">
            Would you like to continue adding more connections to your circle?
          </h4>
        </b-row>
      </b-row>
      <b-row>
        <b-container>
          <b-row class="controls py-2">
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
