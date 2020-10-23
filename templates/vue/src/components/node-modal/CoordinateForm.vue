<template>
  <div id="modal-behaviour">
    <b-form-group>
      <b-form-input
        v-model="getMapCoordinates.lat"
        :type="number"
        placeholder="enter latitude coordinate here"
      />

      <b-form-input
        v-model="getMapCoordinates.lng"
        :type="number"
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
      nodeLat: 55,
      nodeLng: 23,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    getMapCoordinates() {
      return this.node.mapCoordinates ? this.node.mapCoordinates : 0
    },
  },
}
</script>

<!--



<script>
export default {
    name: "coordinate-form",
    props: {
        node: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            nodeLatitude: null,
            nodeLongitude: null,
        }
    },
    computed: {
        ...mapGetters(["getDirectChildren", "getDirectParents", "getNode"]),
        //getMapCoordinates(){
          //  return this.node.mapCoordinates ? this.node.mapCoordinates : null
        //}
    },
}
</script>
-->
