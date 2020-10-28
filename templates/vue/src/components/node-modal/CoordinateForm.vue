<template>
<div>
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
        v-model="node.latCoordinate"
        :number="true"
        placeholder="enter latitude coordinate here"
      />

      <b-form-input
        v-model="node.lngCoordinate"
        :number="true"
        placeholder="enter longitude coordinate here"
      />
    </b-form-group>
  </div>
  <div>
    {{this.node}}
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
      nodeLat: null,
      nodeLng: null,
      isOnMap: false, 
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    inputValid(){
      this.isOnMap && this.nodeLat!="" && this.nodeLng!=""
    }
  },
  watch: {
    nodeLat(){
      this.node.latCoordinate = this.nodeLat
    },
    nodeLng(){
      this.node.lngCoordinate = this.nodeLng
    },
    isOnMap(){
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