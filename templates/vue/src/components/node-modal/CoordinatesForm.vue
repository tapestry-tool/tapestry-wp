<template>
  <div id="modal-coordinates">
    <b-form-group>
      <b-form-checkbox v-model="isOnMap">
        Show on Map
      </b-form-checkbox>
    </b-form-group>
    <b-row v-if="isOnMap">
      <b-col>
        <b-form-input
          v-model="node.mapCoordinates.lat"
          data-qa="node-lat-input"
          :number="true"
          :state="isValidLat ? null : false"
        />
        <b-form-text>Latitude</b-form-text>
      </b-col>
      <b-col>
        <b-form-input
          v-model="node.mapCoordinates.lng"
          data-qa="node-lng-input"
          :number="true"
          :state="isValidLng ? null : false"
        />
        <b-form-text>Longitude</b-form-text>
      </b-col>
    </b-row>
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
    isValidLng() {
      return (
        this.node.mapCoordinates.lng < 180 && this.node.mapCoordinates.lng > -180
      )
    },
    isValidLat() {
      return this.node.mapCoordinates.lat < 90 && this.node.mapCoordinates.lat > -90
    },
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
      this.node.mapCoordinates.lat !== "" && this.node.mapCoordinates.lng !== ""

    if (!isOnMap) {
      this.node.mapCoordinates.lat = ""
      this.node.mapCoordinates.lng = ""
    }
    this.isOnMap = isOnMap
  },
}
</script>
