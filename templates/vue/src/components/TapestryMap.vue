<template>

  <div style="height: 800px; width: 100%">
    <div style="height: 150px overflow: auto;">
      <p>First marker is placed at {{ withPopup.lat }}, {{ withPopup.lng }}</p>
      <p> The bounds are: {{ maxBounds }} </p>
      <p> Settings are: {{this.settings}} </p>
    </div>
    <button @click="hasBounds"> Test retrieve data from settings </button>
    <l-map
      :zoom="zoom"
      :center="center"
      :max-bounds='mapBounds'
      :options="mapOptions"
      style="height: 80%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
     
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"

      />
    </l-map>
  </div>
</template>

<script>
import { latLng, latLngBounds } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";
import { mapState } from 'vuex';

export default {
  name: "Tapestry Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip
  },
  data() {
    return {
      zoom: 14,
      center: latLng(49.262796, -123.252165),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',         
      withPopup: latLng(47.41322, -1.219482),
      mapBounds: latLngBounds([
        [90, 180],
        [-90, -180]
      ]),
      withTooltip: latLng(47.41422, -1.250482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5
      },
    };
  },
  computed: {
    ...mapState(['settings']),
    setBounds(){
      const x = latLngBounds([
        [this.settings.mapBounds.northEast.lat ? this.settings.mapBounds.northEast.lat : 90,
         this.settings.mapBounds.northEast.lng ? this.settings.mapBounds.northEast.lng : 180],
        [this.settings.mapBounds.southWest.lat ? this.settings.mapBounds.southWest.lat : -90,
         this.settings.mapBounds.southWest.lng ? this.settings.mapBounds.southWest.lng : -180]
      ])
      return x;
    }
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    },
  }
};
</script>