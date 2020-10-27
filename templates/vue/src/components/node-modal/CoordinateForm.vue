<template>
  <div id="modal-behaviour">
    <b-form-group>
      <b-form-checkbox
        v-model="isOnMap"
      >
          Show this node on map
      </b-form-checkbox>
    </b-form-group>
    <b-form-group v-if="isOnMap">
      <b-form-input
        v-model="nodeLat"
        placeholder="enter latitude coordinate here"
      />

      <b-form-input
        v-model="nodeLng"
        placeholder="enter longitude coordinate here"
      />
    </b-form-group>
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
      nodeLat: null,
      nodeLng: null,
      isOnMap: false, 
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
  },
  watch: {
    updateLat(nodeLat){
      console.log(nodeLat)
      this.node.latCoordinate = this.nodeLat
    },
    updateLng(nodeLng){
      this.node.lngCoordinate = this.nodeLng
    },
    updateShow(isOnMap){
      this.node.isOnMap = this.isOnMap
    }
  },
  created() {
    this.nodeLat = this.node.latCoordinate
    this.nodeLng = this.node.lngCoordinate
    this.isOnMap = this.node.isOnMap
  },
}
</script>