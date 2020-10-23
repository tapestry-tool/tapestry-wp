<template>
  <div style="height: 800px; width: 100%">
    <!--
    <div style="height: 150px overflow: auto;">
      <p>First marker is placed at {{ withPopup.lat }}, {{ withPopup.lng }}</p>
      <p>The bounds are: {{ setBounds }}</p>
      <p>Settings are: {{ settings }}</p>
    </div>
     :max-bounds="setBounds"
    -->

    <l-map
      :options="mapOptions"
      :bounds="setBounds"
      style="height: 80%"
      :zoom="zoom"
      :center="center"
      @update:center="updateCenter"
      @update:zoom="updateZoom"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-marker :lat-lng="markerLatLng"></l-marker>
    </l-map>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import { latLng, latLngBounds } from "leaflet"
import { LMap, LTileLayer, LMarker } from "vue2-leaflet"
import { mapState } from "vuex"

export default {
  name: "tapestry-map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      zoom: 14,
      center: latLng(49.262796, -123.252165),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      mapOptions: {
        zoomSnap: 0.1,
        scrollWheelZoom: false,
      },
      markerLatLng: latLng(47.412, -1.218),
    }
  },
  computed: {
    ...mapState(["settings"]),
    setBounds() {
      const x = latLngBounds([
        [
          +this.settings.mapBounds.swLat || -90,
          +this.settings.mapBounds.swLng || -180,
        ],
        [
          +this.settings.mapBounds.neLat || 90,
          +this.settings.mapBounds.neLng || 180,
        ],
      ])
      return x
    },
  },
  methods: {
    updateZoom(zoom) {
      this.currentZoom = zoom
    },
    updateCenter(center) {
      this.currentCenter = center
    },
    showLongText() {
      this.showParagraph = !this.showParagraph
    },
    innerClick() {
      alert("Click!")
    },
  },
}
</script>
