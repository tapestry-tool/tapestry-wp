<template>
  <div style="display: flex">
    <div style="overflow-y: auto; width: 15%; margin-right: 20px">
      <div
        v-if="empty && canEdit"
        style="padding: 5px; margin-bottom: 10px; border: 2px solid #007bff; border-radius: 5px"
      >
        <b-button size="sm" variant="light" block @click="addRootNode()">
          Add root node
        </b-button>
      </div>
      <div
        v-for="(node, id) in nodes"
        :key="id"
        style="padding: 5px; margin-bottom: 10px; border: 2px solid #007bff; border-radius: 5px"
      >
        <h6>{{ node.title }}</h6>
        <b-button
          v-if="isLoggedIn && hasPermission('edit') && !hasMapCoordinates(node)"
          size="sm"
          variant="light"
          block
          @click="editNodeCoordinates(id)"
        >
          Add node to map
        </b-button>
        <div v-if="hasMapCoordinates(node)">
          Lat: {{ node.mapCoordinates.lat }} Long: {{ node.mapCoordinates.lng }}
        </div>
      </div>
      <div
        style="padding: 5px; margin-bottom: 10px; border: 2px solid #007bff; border-radius: 5px"
      >
        <b-button size="sm" variant="light" block @click="addNewNode()">
          Add new node
        </b-button>
      </div>
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
          :icon="
            marker.status == 'draft'
              ? draftIcon
              : marker.accessible
              ? icon
              : inaccessibleIcon
          "
        >
          <l-popup>
            <h5>{{ marker.title }}</h5>
            <b-button
              v-if="marker.accessible"
              size="sm"
              variant="light"
              @click="openNode(marker.id)"
            >
              view
            </b-button>
            <b-button
              v-if="isLoggedIn && hasPermission('edit')"
              size="sm"
              variant="light"
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
import draftMarker from "@/assets/map-marker-draft.png"
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
      draftIcon: icon({
        iconUrl: draftMarker,
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
    empty() {
      return Object.keys(this.nodes).length === 0
    },
    canEdit() {
      return wpData.wpCanEditTapestry === "1"
    },
    markerlocations() {
      const markers = []
      for (const [id, node] of Object.entries(this.nodes)) {
        if (this.hasMapCoordinates(node)) {
          markers.push({
            id: id,
            pos: latLng(node.mapCoordinates.lat, node.mapCoordinates.lng),
            title: node.title,
            accessible: node.accessible,
            status: node.status,
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
    hasMapCoordinates(node) {
      if (node.mapCoordinates) {
        return node.mapCoordinates.lat != "" && node.mapCoordinates.lng != ""
      } else {
        return false
      }
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
    addNewNode() {},
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    editNodeCoordinates(id) {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: id, type: "edit", tab: "coordinates" },
        query: this.$route.query,
      })
    },
    hasPermission(action) {
      return Helpers.hasPermission(this.node, action)
    },
  },
}
</script>
