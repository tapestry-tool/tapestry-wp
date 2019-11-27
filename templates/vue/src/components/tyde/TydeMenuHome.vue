<template>
  <section id="tyde-menu-home">
    <nav>
      <ul>
        <tyde-tab
          v-for="tab in tabs"
          :key="tab"
          :is-active="tab === activeTab"
          @click="setActiveTab(tab)"
        >
          See {{ tab }}
        </tyde-tab>
      </ul>
    </nav>
    <ul class="logs">
      <tyde-log v-for="log in visibleLogs" :key="log.name" :log="log" />
    </ul>
  </section>
</template>

<script>
import TydeLog from "./TydeLog"
import TydeTab from "./TydeTab"
import Helpers from "@/utils/Helpers"
import TapestryApi from "@/services/TapestryAPI"

const TapestryApiClient = new TapestryApi(wpPostId)

export default {
  name: "tyde-menu-home",
  components: {
    TydeLog,
    TydeTab,
  },
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
  },
  watch: {
    /**
     * Further filter the logs to check if there are valid answers recorded
     * on the server or not. If not, don't show those logs.
     */
    logs: {
      immediate: true,
      handler(newLogs) {
        newLogs.forEach(async log => {
          if (log.audioId) {
            const audioSrc = await this.getAudioSrc(log.nodeId, log.audioId)
            if (audioSrc) this.logsWithAnswers.push({ ...log, audioSrc })
          } else {
            this.logsWithAnswers.push({ ...log })
          }
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
  },
}
</script>

<style lang="scss" scoped>
#tyde-menu-home {
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
