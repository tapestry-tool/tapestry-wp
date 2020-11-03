<template>
  <div style="display: flex">
    <div style="width: 15%;">
      <p v-for="value in Object.values(this.nodes)" :key="value.id">
        {{ value.title }}
        <!--
            <b-button v-if="value.accessible" @click="openNode(value.id)" size="sm">
              view
            </b-button>
            <b-button v-if="isLoggedIn && hasPermission('edit')" @click="editNode(value.id)" size="sm" varient="light">
              edit
            </b-button>
            -->
      </p>
    </div>
    <div style="height: 900px; width: 80%">
      <l-map
        :options="mapOptions"
        :bounds="setBounds"
        :max-bounds="worldBounds"
        style="height: 80%"
        @update:center="updateCenter"
        @update:zoom="updateZoom"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="marker in markerlocations"
          :key="marker.id"
          :lat-lng="marker.pos"
          :icon="marker.accessible ? icon : inaccessibleIcon"
        >
          <l-popup>
            <h5>{{ marker.title }}</h5>
            <b-button
              v-if="marker.accessible"
              size="sm"
              @click="openNode(marker.id)"
            >
              view
            </b-button>
            <b-button
              v-if="isLoggedIn && hasPermission('edit')"
              size="sm"
              varient="light"
              @click="editNode(marker.id)"
            >
              edit
            </b-button>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import mapMarker from "@/assets/map-marker.png"
import invalidMarker from "@/assets/map-marker-inaccessible.png"
import { latLng, latLngBounds, icon } from "leaflet"
import { LMap, LTileLayer, LMarker, LPopup } from "vue2-leaflet"
import { mapState } from "vuex"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import { isLoggedIn } from "@/utils/wp"

export default {
  name: "tapestry-map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
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
        iconAnchor: [16, 32],
        popupAnchor: [0, -20],
      }),
      inaccessibleIcon: icon({
        iconUrl: invalidMarker,
        iconSize: [32, 33],
        iconAnchor: [16, 32],
        popupAnchor: [0, -20],
      }),
      worldBounds: latLngBounds([
        [-90, -180],
        [90, 180],
      ]),
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
    isLoggedIn() {
      return isLoggedIn
    },
    markerlocations() {
      const markers = []
      for (const [key, value] of Object.entries(this.nodes)) {
        if (this.hasMapCoordinates(value.mapCoordinates)) {
          markers.push({
            id: key,
            pos: latLng(value.mapCoordinates.lat, value.mapCoordinates.lng),
            title: value.title,
            accessible: value.accessible,
          })
        }
      }
      return markers
    },
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
    editNode(id) {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: id, type: "edit", tab: "content" },
        query: this.$route.query,
      })
    },
    hasPermission(action) {
      return Helpers.hasPermission(this.node, action)
    },
  },
}
</script>
