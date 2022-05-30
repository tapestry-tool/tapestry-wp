<template>
  <div id="modal-coordinates" v-if="mapCoordinates">
    <b-form-group>
      <b-form-checkbox v-model="isOnMap">
        Show on Map
      </b-form-checkbox>
    </b-form-group>
    <b-row v-if="isOnMap">
      <b-col>
        <b-form-input
          :value="mapCoordinates.lat"
          @update="inputProperty('lat', $event)"
          data-qa="node-lat-input"
          :number="true"
          :state="isValidLat ? null : false"
        />
        <b-form-text>Latitude</b-form-text>
      </b-col>
      <b-col>
        <b-form-input
          :value="mapCoordinates.lng"
          @update="inputProperty('lng', $event)"
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
export default {
  model: {
    prop: "mapCoordinates",
    event: "input",
  },
  props: {
    mapCoordinates: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isOnMap: false,
    }
  },
  computed: {
    isValidLng() {
      return (
        this.mapCoordinates.lng < 181 && this.mapCoordinates.lng > -181
      )
    },
    isValidLat() {
      return this.mapCoordinates.lat < 91 && this.mapCoordinates.lat > -91
    },
  },
  watch: {
    isOnMap(isOnMap) {
      if (!isOnMap) {
        this.input({
          lat: "",
          lng: "",
        })
      }
    },
  },
  created() {
    if (!this.mapCoordinates) {
      this.input({
        lat: "",
        lng: "",
      })
    }
    const isOnMap =
      this.mapCoordinates.lat !== "" && this.mapCoordinates.lng !== ""

    if (!isOnMap) {
      this.input({
        lat: "",
        lng: "",
      })
    }
    this.isOnMap = isOnMap
  },
  methods: {
    input(value) {
      this.$emit("input", value)
    },
    inputProperty(property, value) {
      this.input({
        ...this.mapCoordinates,
        [property]: value,
      })
    },
  },
}
</script>
