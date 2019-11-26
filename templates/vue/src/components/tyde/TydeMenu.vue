<template>
  <div id="tyde-menu">
    <div class="buttons">
      <tyde-button icon="cog" @click="setActivePage('settings')"></tyde-button>
      <tyde-button icon="globe-asia" @click="$emit('return-to-map')"></tyde-button>
      <tyde-button icon="question" @click="setActivePage('help')"></tyde-button>
    </div>
    <loading v-if="loading" />
    <div v-else class="content">
      <h1>Captain's Log</h1>
      <tyde-menu-home v-if="activePage === 'home'" :logs="logs" />
      <tyde-menu-settings
        v-if="activePage === 'settings'"
        :settings="settings"
        @back="setActivePage('home')"
        @settings-change="updateSettings"
      />
      <tyde-menu-help v-if="activePage === 'help'" @back="setActivePage('home')" />
    </div>
    <div class="continue">
      <tyde-button icon="arrow-right" @click="$emit('continue')"></tyde-button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import GravityFormsApi from "@/services/GravityFormsApi"
import Loading from "@/components/Loading"

import TydeButton from "./TydeButton"
import TydeMenuHome from "./TydeMenuHome"
import TydeMenuSettings from "./TydeMenuSettings"
import TydeMenuHelp from "./TydeMenuHelp"

const mapIdToKey = {
  textId: "text",
  checklistId: "checklist",
}

export default {
  name: "tyde-menu",
  components: {
    Loading,
    TydeButton,
    TydeMenuHome,
    TydeMenuSettings,
    TydeMenuHelp,
  },
  data() {
    return {
      activePage: "home",
      settings: {
        isAudioPlaying: false,
      },
      entries: {},
      loading: false,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    completedQuestions() {
      return this.nodes.filter(
        node => node.quiz && node.quiz.some(question => question.completed)
      )
    },
    logs() {
      const completedContents = this.nodes
        .filter(node => node.completed)
        .map(node => {
          return {
            type: "content",
            title: node.title,
            imageURL: node.imageURL,
            description: node.description,
            isFavourite: node.isFavourite,
          }
        })
      const completedActivities = this.nodes.reduce((activities, currentNode) => {
        if (currentNode.quiz) {
          const completedQuestions = currentNode.quiz
            .filter(q => q.completed)
            .map(q => {
              const keys = Object.keys(q.answers)
              return keys
                .filter(key => q.answers[key])
                .map(key => {
                  return {
                    type: "activity",
                    title: q.text,
                    nodeId: currentNode.id,
                    [mapIdToKey[key]]: this.getAnswer(currentNode.id, q.id, key),
                  }
                })
            })
          return [...activities, ...completedQuestions.flat()]
        }
      }, [])
      return [...completedContents, ...completedActivities]
    },
  },
  watch: {
    settings(newSettings, prevSettings) {
      if (newSettings.isAudioPlaying !== prevSettings.isAudioPlaying) {
        this.$emit("audio-change")
      }
    },
  },
  created() {
    this.loading = this.completedQuestions.length > 0
  },
  async mounted() {
    if (this.completedQuestions.length > 0) {
      this.entries = await GravityFormsApi.getAllEntries(this.nodes)
      this.loading = false
    }
  },
  methods: {
    setActivePage(page) {
      this.activePage = page
    },
    updateSettings(partialNewSettings) {
      this.settings = { ...this.settings, ...partialNewSettings }
    },
    getAnswer(nodeId, questionId, answerKey) {
      const quiz = this.entries[nodeId]
      const question = quiz.find(question => question.id === questionId)
      return question.answers[mapIdToKey[answerKey]]
    },
  },
}
</script>

<style lang="scss" scoped>
#tyde-menu {
  width: 100vw;
  height: 100vh;
  position: fixed;
  text-align: left;
  top: 0;
  left: 0;
  background: black;
  color: white;
  z-index: 200;
  padding: 16px 80px;

  .buttons {
    width: 100%;
    display: flex;
    margin-bottom: 10px;
  }

  .content {
    background: var(--tapestry-gray);
    border: 4px solid white;
    height: calc(100vh - 86px);
    padding: 16px 32px;
    position: relative;
    z-index: 0;

    h1 {
      position: absolute;
      right: 1.5em;
      top: -63px;
      padding: 16px 3em;
      line-height: 1;
      margin: 0;
      font-weight: 900;
      font-size: 30px;
      text-transform: uppercase;
      z-index: 10;

      &:before {
        display: none;
      }

      &:after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        padding: 16px 3em;
        background: var(--tapestry-gray);
        border: 4px solid white;
        border-bottom: 4px solid var(--tapestry-gray);
        transform: perspective(10px) rotateX(1deg);
        z-index: -1;
      }
    }
  }

  .continue {
    position: fixed;
    bottom: 2em;
    right: 2em;
    z-index: 20;

    tyde-button {
      width: 96px;
      height: 96px;
      font-size: 56px;
    }
  }
}
</style>
