<template>
  <div>
    <div id="modal-coordinates">
      <b-form-group>
        <b-form-checkbox v-model="isOnMap">
          Show this node on map
        </b-form-checkbox>
      </b-form-group>
      <b-form-group v-if="isOnMap">
        <b-form-input
          v-model="node.mapCoordinates.lat"
          :number="true"
          placeholder="Enter latitude"
        />

        <b-form-input
          v-model="node.mapCoordinates.lng"
          :number="true"
          placeholder="Enter longitude"
        />
      </b-form-group>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isOnMap: false,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
  },
  watch: {
    isOnMap(isOnMap) {
      if (!isOnMap) {
        this.node.mapCoordinates.lat = ""
        this.node.mapCoordinates.lng = ""
      }
    },
  },
  created() {
    if (!this.node.mapCoordinates) {
      this.node.mapCoordinates = {
        lat: "",
        lng: "",
      }
    }
    const isOnMap =
      this.node.mapCoordinates.lat != "" && this.node.mapCoordinates.lng != ""

    if (!isOnMap) {
      this.node.mapCoordinates.lat = ""
      this.node.mapCoordinates.lng = ""
    }
    this.isOnMap = isOnMap
  },
}
</script>
