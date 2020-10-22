<template>
  <div id="modal-behaviour">
    <b-form-group>
      <b-form-checkbox
        v-if="node.mediaType !== 'accordion'"
        v-model="node.skippable"
        data-testid="node-behaviour-skippable"
      >
        Coordinae Form
      </b-form-checkbox>
    </b-form-group>
  </div>
</template>

<script>
export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
}
</script>

<!--
<template>
    <div>
        Hello from Coordinate form
    </div>


    <div id="modal-coordinate">
        <b-form-group>
        <b-form-input
                v-model="nodeLatitude"
                :type="number"
                placeholder="latitude"
            />
            <b-form-input
                v-model="nodeLongitude"
                :type="number"
                placeholder="longitude"
            />
                    
        </b-form-group>
    </div>

</template>


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
