<template>
  <div>
    <div id="modal-coordinate">
      <b-form-group>
        <b-form-checkbox v-model="isOnMap">
          Show this node on map
        </b-form-checkbox>
      </b-form-group>
      <b-form-group v-if="isOnMap">
        <b-form-input
          v-model="node.mapCoordinates.lat"
          :number="true"
          placeholder="enter latitude coordinate here"
        />

        <b-form-input
          v-model="node.mapCoordinates.lng"
          :number="true"
          placeholder="enter longitude coordinate here"
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
    /*
    nodeLat(){
      this.node.mapCoordinates.lat = this.nodeLat
    },
    nodeLng(){
      this.node.mapCoordinates.lng = this.nodeLng
    },
    */
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
