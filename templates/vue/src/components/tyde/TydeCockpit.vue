<template>
  <section id="tyde-cockpit" :style="cockpitImage">
    <div v-for="node in this.nodes" :key="node.id">
      <div
        v-if="isNodeModuleType(node)"
        :id="`tyde-cockpit-` + node.id"
        :src="moduleImage(node)"
        :style="moduleStyles(node)"
        @mouseover="nodeMouseOverHandler(node)"
        @mouseleave="nodeMouseLeaveHandler(node)"
      ></div>
    </div>
  </section>
</template>

<script>
import Helpers from "@/utils/Helpers"
import TapestryApi from "@/services/TapestryAPI"
import { tydeTypes } from "@/utils/constants"
import { mapGetters } from "vuex"

const TapestryApiClient = new TapestryApi(wpPostId)

export default {
  name: "tyde-cockpit",
  props: {
    logs: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      activeTab: "all",
      logsWithAnswers: [],
      tabs: ["all", "activities", "content" /*, "favourites"*/],
    }
  },
  computed: {
    ...mapGetters(["settings", "nodes"]),
    visibleLogs() {
      const filter = this.activeTab
      if (filter === "activities") {
        return this.logsWithAnswers.filter(item => item.type === "activity")
      }
      if (filter === "content") {
        return this.logsWithAnswers.filter(item => item.type === "content")
      }
      if (filter === "favourites") {
        return this.logsWithAnswers.filter(item => item.isFavourite)
      }
      return this.logsWithAnswers
    },
    cockpitImage() {
      return {
        backgroundImage: `url(${this.settings.spaceshipBackgroundUrl})`,
      }
    },
  },
  watch: {
    /**
     * Further filter the logs to check if there are valid answers recorded
     * on the server or not. If not, don't show those logs.
     */
    logs: {
      immediate: true,
      handler(newLogs) {
        const promises = newLogs.map(log => {
          if (log.audio && log.audio.id) {
            return new Promise(resolve => {
              this.getAudioSrc(log.nodeId, log.audio.id).then(audioSrc => {
                resolve({ ...log, audioSrc })
              })
            })
          } else {
            return Promise.resolve(log)
          }
        })
        Promise.all(promises).then(logsWithAnswers => {
          this.logsWithAnswers = logsWithAnswers
        })
      },
    },
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab
    },
    async getAudioSrc(nodeId, audioId) {
      try {
        const audio = await TapestryApiClient.getH5PAudioFromServer(nodeId, audioId)
        const blob = await Helpers.base64ToBlob(audio, "audio/wav")
        return URL.createObjectURL(blob)
      } catch (e) {
        console.error(e)
        return ""
      }
    },
    moduleStyles(node) {
      return {
        backgroundImage: `url(${node.typeData.spaceshipPartNotEarnedIconUrl})`,
        position: "relative",
        top: node.typeData.spaceshipPartY + "px",
        left: node.typeData.spaceshipPartX + "px",
        height: node.typeData.spaceshipPartHeight + "px",
        width: node.typeData.spaceshipPartWidth + "px",
      }
    },
    moduleImage(node) {
      if (node.tydeProgress == 1) {
        return node.typeData.spaceshipPartEarnedIconUrl
      } else {
        return node.typeData.spaceshipPartNotEarnedIconUrl
      }
    },
    isNodeModuleType(node) {
      return node.tydeType === tydeTypes.MODULE
    },
    nodeMouseOverHandler(node) {
      document.getElementById(
        "tyde-cockpit-" + node.id
      ).style.backgroundImage = `url(${node.typeData.spaceShipPartHoverIconUrl})`
    },
    nodeMouseLeaveHandler(node) {
      document.getElementById(
        "tyde-cockpit-" + node.id
      ).style.backgroundImage = `url(${this.moduleImage(node)})`
    },
  },
}
</script>

<style lang="scss" scoped>
#tyde-cockpit {
  height: 85vh;
  nav ul {
    display: flex;
    font-size: 16px;
    justify-content: left;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .logs {
    margin-top: 26px;
    height: calc(100vh - 210px);
    overflow-y: scroll;
  }
}
</style>
