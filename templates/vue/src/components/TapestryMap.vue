<template>
  <div id="map-container" class="mx-n3 my-3">
    <div v-if="canEdit" class="nodes-list px-3">
      <b-card
        v-for="(node, id) in nodes"
        :key="id"
        :class="{ selected: id === selectedId }"
        @click="selectNode(id)"
      >
        <h6 class="card-sub-title">{{ node.title }}</h6>
        <b-table
          v-if="hasMapCoordinates(node)"
          class="my-2"
          small
          stacked
          :items="[node.mapCoordinates]"
        ></b-table>
        <b-button
          v-if="isLoggedIn && canEditNode(node)"
          size="sm"
          class="text-small"
          variant="secondary"
          @click="editNode(id)"
        >
          Edit
        </b-button>
        <b-button
          v-if="isLoggedIn && canEditNode(node) && !hasMapCoordinates(node)"
          size="sm"
          class="text-small"
          variant="success"
          @click="editNodeCoordinates(id)"
        >
          Add to map
        </b-button>
      </b-card>
      <b-button class="add-new-node-btn" block @click="addNewNode">
        <i class="fas fa-plus-circle fa-3x"></i>
        <br />
        Add new node
      </b-button>
    </div>
    <div class="map-content">
      <l-map
        ref="map"
        :options="mapOptions"
        :bounds="getBounds"
        :max-bounds="worldBounds"
        @update:center="updateCenter"
        @update:zoom="updateZoom"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="marker in markerlocations"
          :key="marker.id"
          :ref="`marker-${marker.id}`"
          :data-qa="`marker-${marker.id}`"
          :lat-lng="marker.pos"
          :icon="getMarkerIcon(marker)"
          @click="selectNode(marker.id)"
        >
          <l-popup>
            <b-button
              v-if="marker.accessible || canEdit"
              variant="link"
              @click="openNode(marker.id)"
            >
              <h6>{{ marker.title }}</h6>
            </b-button>
            <div v-else>
              <h6>{{ marker.title }}</h6>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import mapMarkerDefault from "@/assets/map-marker.png"
import mapMarkerInaccessible from "@/assets/map-marker-inaccessible.png"
import mapMarkerDraft from "@/assets/map-marker-draft.png"
import { latLng, latLngBounds, icon } from "leaflet"
import { LMap, LTileLayer, LMarker, LPopup } from "vue2-leaflet"
import { mapState } from "vuex"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import * as wp from "@/services/wp"

export default {
  name: "tapestry-map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
  },
  props: {
    isSidebarOpen: {
      type: Boolean,
      required: false,
    },
  },
  computed: {
    ...mapState(["settings", "nodes", "rootId"]),
    url() {
      return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    },
    attribution() {
      return '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    },
    mapOptions() {
      return {
        zoomSnap: 0.1,
        scrollWheelZoom: false,
      }
    },
    worldBounds() {
      return latLngBounds([
        [-90, -180],
        [90, 180],
      ])
    },
    selectedId() {
      return this.$route.params.nodeId
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    canEdit() {
      return wp.canEditTapestry()
    },
    getBounds() {
      return latLngBounds([
        [
          this.getCoord(this.settings.mapBounds.swLat, -90),
          this.getCoord(this.settings.mapBounds.swLng, -180),
        ],
        [
          this.getCoord(this.settings.mapBounds.neLat, 90),
          this.getCoord(this.settings.mapBounds.neLng, 180),
        ],
      ])
    },
    isEmpty() {
      return Object.keys(this.nodes).length === 0
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
  watch: {
    isSidebarOpen() {
      // Let Leaflet know the container size has changed so it can adjust the map size
      setTimeout(() => {
        this.$refs.map.mapObject.invalidateSize()
      }, 300)
    },
    selectedId(id) {
      const marker = this.$refs["marker-" + id]
      if (marker) {
        marker[0].mapObject.fire("click")
      }
    },
  },
  methods: {
    getCoord(coord, coordIfEmpty) {
      return coord === "" ? coordIfEmpty : coord
    },
    getMarkerIcon(marker) {
      const iconSettings = {
        iconSize: [32, 33],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
      }
      let mapMarker = mapMarkerDefault
      if (marker.status === "draft") {
        mapMarker = mapMarkerDraft
      } else if (!marker.accessible) {
        mapMarker = mapMarkerInaccessible
      }
      return icon({ ...iconSettings, iconUrl: Helpers.getImagePath(mapMarker) })
    },
    updateZoom(zoom) {
      this.currentZoom = zoom
    },
    updateCenter(center) {
      this.currentCenter = center
    },
    hasMapCoordinates(node) {
      if (node.mapCoordinates) {
        return node.mapCoordinates.lat !== "" && node.mapCoordinates.lng !== ""
      } else {
        return false
      }
    },
    selectNode(id) {
      if (this.selectedId !== id) {
        this.$router.push({
          name: names.APP,
          params: { nodeId: id },
          query: this.$route.query,
        })
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
    addNewNode() {
      this.$router.push({
        name: names.MODAL,
        params: {
          nodeId: this.isEmpty ? 0 : this.rootId,
          type: "add",
          tab: "content",
        },
        query: this.$route.query,
      })
    },
    editNodeCoordinates(id) {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: id, type: "edit", tab: "coordinates" },
        query: this.$route.query,
      })
    },
    canEditNode(node) {
      return Helpers.hasPermission(node, "edit")
    },
  },
}
</script>

<style lang="scss" scoped>
#map-container {
  display: flex;

  .nodes-list {
    text-align: left;
    width: 280px;

    > .card {
      margin-bottom: 10px;

      &.selected {
        background-color: #eee;
      }

      .card-body {
        padding: 0.8em;
      }
    }

    .add-new-node-btn {
      background-color: #2c3e50;
      background-color: #2c3e50;

      &:hover {
        border-color: #11a6d8;
        background-color: #11a6d8;
      }
    }

    + .map-content {
      width: calc(100% -280px);
    }
  }

  .map-content {
    height: 900px;
    width: 100%;
    margin-bottom: -20%;

    > div {
      height: 80%;
    }
  }
}
</style>

<style lang="scss">
#map-container .nodes-list > .card .card-body table tbody > tr {
  font-size: 0.8em;
  background-color: #eee;

  > [data-label]::before {
    width: 35px;
  }
  > [data-label] > div {
    width: calc(100% - 35px);
  }
}
</style>
