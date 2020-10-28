<template>
  <div>
    <div style="height: 800px; width: 100%">
      <l-map
        :options="mapOptions"
        :bounds="setBounds"
        style="height: 80%"
        @update:center="updateCenter"
        @update:zoom="updateZoom"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="marker in markers"
          :key="marker.id"
          :lat-lng="marker.pos"
          :icon="icon"
          @click="openNode(marker.id)"
        />
      </l-map>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import mapMarker from "@/assets/map-marker.png"
import { latLng, latLngBounds, icon } from "leaflet"
import { LMap, LTileLayer, LMarker } from "vue2-leaflet"
import { mapState } from "vuex"
import { names } from "@/config/routes"

export default {
  name: "tapestry-map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      mapOptions: {
        zoomSnap: 0.1,
        scrollWheelZoom: false,
      },
      icon: icon({
        iconUrl: mapMarker,
        iconSize: [32, 33],
        iconAnchor: [16, 37],
      }),
      markers: [],
    }
  },
  computed: {
    ...mapState(["settings", "nodes"]),
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
  created() {
    for (const [key, value] of Object.entries(this.nodes)) {
      if (this.hasMapCoordinates(value.mapCoordinates)) {
        this.markers.push({
          id: key,
          pos: latLng(value.mapCoordinates.lat, value.mapCoordinates.lng),
        })
      }
    }
  },
  methods: {
    updateZoom(zoom) {
      this.currentZoom = zoom
    },
    updateCenter(center) {
      this.currentCenter = center
    },
    hasMapCoordinates(mapCoordinates) {
      return mapCoordinates.lat != "" && mapCoordinates.lng != ""
    },
    openNode(id) {
      this.$router.push({
        name: names.LIGHTBOX,
        params: { nodeId: id },
        query: this.$route.query,
      })
    },
  },
}
</script>
