<template>
  <div
    :id="`kaltura-container-${node.id}`"
    ref="kalturaContainer"
    :class="['kaltura-video-container', { fullscreen: node.fullscreen }]"
  ></div>
</template>

<script>
import { mapActions, mapState } from "vuex"
import { data as wpData } from "@/services/wp"

export default {
  name: "kaltura-video-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
      validator: val => {
        return ["width", "height"].every(prop => val.hasOwnProperty(prop))
      },
    },
    playing: {
      type: Boolean,
      required: true,
    },
    autoplay: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      videoDimensions: null,
    }
  },
  computed: {
    ...mapState(["kalturaStatus"]),
    kalturaData() {
      return this.node.typeData.kalturaData
    },
  },
  mounted() {
    kWidget.embed({
      targetId: `kaltura-container-${this.node.id}`,
      wid: `_${wpData.kaltura.kalturaPartnerId}`,
      uiconf_id: wpData.kaltura.uniqueConfiguration,
      entry_id: this.kalturaData.id,
    })
    kWidget.addReadyCallback(playerId => {
      const kalturaVideo = document.getElementById(playerId)
      const kalturaIframe = document.querySelector(
        `#kaltura-container-${this.node.id} > iframe`
      )

      kalturaIframe.style.minHeight = "0"
      this.$emit("load", {
        currentTime: 0,
      })
    })
  },
  methods: {
    ...mapActions(["fetchKalturaStatus"]),
  },
}
</script>

<style lang="scss">
.kaltura-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  display: flex;
  opacity: 1 !important;

  &.fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
