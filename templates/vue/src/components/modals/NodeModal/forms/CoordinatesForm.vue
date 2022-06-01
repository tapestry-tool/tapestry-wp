<template>
  <div v-if="mapCoordinates" id="modal-coordinates">
    <b-form-group>
      <b-form-checkbox v-model="isOnMap">
        Show on Map
      </b-form-checkbox>
    </b-form-group>
    <b-row v-if="isOnMap">
      <b-col>
        <b-form-input
          :value="mapCoordinates.lat"
          data-qa="node-lat-input"
          :number="true"
          :state="isValidLat ? null : false"
          @update="update('mapCoordinates.lat', $event)"
        />
        <b-form-text>Latitude</b-form-text>
      </b-col>
      <b-col>
        <b-form-input
          :value="mapCoordinates.lng"
          data-qa="node-lng-input"
          :number="true"
          :state="isValidLng ? null : false"
          @update="update('mapCoordinates.lng', $event)"
        />
        <b-form-text>Longitude</b-form-text>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"
export default {
  data() {
    return {
      isOnMap: false,
    }
  },
  computed: {
    ...mapState({
      mapCoordinates: state => state.currentEditingNode.mapCoordinates,
    }),
    isValidLng() {
      return this.mapCoordinates.lng < 181 && this.mapCoordinates.lng > -181
    },
    isValidLat() {
      return this.mapCoordinates.lat < 91 && this.mapCoordinates.lat > -91
    },
  },
  watch: {
    isOnMap(isOnMap) {
      if (!isOnMap) {
        this.update("mapCoordinates", {
          lat: "",
          lng: "",
        })
      }
    },
  },
  created() {
    if (!this.mapCoordinates) {
      this.update("mapCoordinates", {
        lat: "",
        lng: "",
      })
    }
    const isOnMap = this.mapCoordinates.lat !== "" && this.mapCoordinates.lng !== ""

    if (!isOnMap) {
      this.update("mapCoordinates", {
        lat: "",
        lng: "",
      })
    }
    this.isOnMap = isOnMap
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
  },
}
</script>
