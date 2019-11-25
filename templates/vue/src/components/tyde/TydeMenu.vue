<template>
  <div id="tyde-menu">
    <div class="buttons">
      <tyde-button icon="cog" @click="setActivePage('settings')"></tyde-button>
      <tyde-button icon="globe-asia" @click="$emit('return-to-map')"></tyde-button>
      <tyde-button icon="question" @click="setActivePage('help')"></tyde-button>
    </div>
    <div class="content">
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

import TydeButton from "./TydeButton"
import TydeMenuHome from "./TydeMenuHome"
import TydeMenuSettings from "./TydeMenuSettings"
import TydeMenuHelp from "./TydeMenuHelp"

export default {
  name: "tyde-menu",
  components: {
    TydeButton,
    TydeMenuHome,
    TydeMenuSettings,
    TydeMenuHelp,
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
      activePage: "home",
      settings: {
        isAudioPlaying: false,
      },
    }
  },
  computed: {
    ...mapState(["nodes"]),
  },
  watch: {
    settings(newSettings, prevSettings) {
      if (newSettings.isAudioPlaying !== prevSettings.isAudioPlaying) {
        this.$emit("audio-change")
      }
    },
  },
  async mounted() {
    const entries = await this.getAllEntries()
    console.log(entries)
  },
  methods: {
    async getAllEntries() {
      const nodesWithQuestions = this.nodes.filter(
        node => node.quiz && node.quiz.length > 0
      )
      const populatedNodes = await Promise.all(
        nodesWithQuestions.map(async node => {
          const populatedQuestions = await Promise.all(
            node.quiz.map(async question => {
              const { checklistId, textId } = question.answers
              const checklistAnswers = checklistId
                ? await GravityFormsApi.getEntries(checklistId)
                : []
              const textAnswers = textId
                ? await GravityFormsApi.getEntries(textId)
                : []
              return {
                id: question.id,
                answers: {
                  text: textAnswers,
                  checklist: checklistAnswers,
                },
              }
            })
          )
          return { id: node.id, quiz: populatedQuestions }
        })
      )
      const nodeQuizMap = {}
      populatedNodes.forEach(node => {
        nodeQuizMap[node.id] = node.quiz
      })
      return nodeQuizMap
    },
    setActivePage(page) {
      this.activePage = page
    },
    updateSettings(partialNewSettings) {
      this.settings = { ...this.settings, ...partialNewSettings }
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
