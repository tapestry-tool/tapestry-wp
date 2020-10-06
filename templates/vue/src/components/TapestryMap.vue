<template>

  <div style="height: 800px; width: 100%">
    <div style="height: 150px overflow: auto;">
      <p>First marker is placed at {{ withPopup.lat }}, {{ withPopup.lng }}</p>
      <p>Center is at {{ currentCenter }} and the zoom is: {{ currentZoom }}</p>
    </div>
    <!-- :bounds="bounds" --> 
    <l-map
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="height: 80%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
     
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      />
      <l-control position="bottomleft" >
      
      </l-control>
    </l-map>
  </div>
</template>

<script>
import { latLng, latLngBounds } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";

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
      /*bounds: latLng([
        [settings.mapBounds._northEast.lat, settings.bounds._northEast.lng],
        [settings.mapBounds._southWest.lat, settings.bounds._southWest.lng]
      ]),
      */
      withTooltip: latLng(47.41422, -1.250482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5
      },
    };
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
    }
  }
};
</script>