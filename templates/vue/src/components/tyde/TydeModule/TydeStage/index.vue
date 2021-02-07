<template>
  <div :id="`stage-${nodeId}`" class="stage-wrapper" :style="nodeStyles">
    <div>
      <div class="stage-header">
        <tyde-progress-bar :node-id="selectedModuleId" />
        <div class="stage-star" data-qa="tyde-stage-star">
          <img :src="done ? activeStarSrc : inactiveStarSrc" />
          <div v-if="!done">{{ numComplete }}/{{ topics.length }}</div>
        </div>
        <h1>{{ node.title }}</h1>
        <tyde-button
          class="close-button"
          icon="times"
          data-qa="tyde-stage-close-button"
          @click="handleClick($event, 'close')"
        ></tyde-button>
      </div>
      <section>
        <tyde-star-celebration v-if="showStar" @close="showStar = false" />
        <tyde-topic
          v-for="topic in filteredTopics"
          :key="topic.id"
          :topic="topic"
          :show-complete="true"
          style="align-self: flex-start;"
          @click="openTopic($event, topic.id)"
        />
      </section>
      <footer>
        <tyde-button
          :disabled="!stageIndex"
          label="Prev"
          data-qa="tyde-stage-prev-button"
          @click="handleClick($event, 'prev')"
        ></tyde-button>
        <tyde-button
          :disabled="!done"
          label="Next"
          data-qa="tyde-stage-next-button"
          @click="handleClick($event, 'next')"
        ></tyde-button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import TydeButton from "@/components/tyde/common/TydeButton"
import TydeTopic from "@/components/tyde/common/TydeTopic"
import TydeProgressBar from "@/components/tyde/common/TydeProgressBar"
import TydeStarCelebration from "./TydeStarCelebration"
import ActiveStar from "@/assets/star-active.png"
import InactiveStar from "@/assets/star-inactive.png"
import Helpers from "@/utils/Helpers"
import { tydeTypes } from "@/utils/constants"
import client from "@/services/TapestryAPI"

export default {
  name: "tyde-stage",
  components: {
    TydeButton,
    TydeTopic,
    TydeProgressBar,
    TydeStarCelebration,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: true,
    },
    stageIndex: {
      type: [Number],
      default: 1,
    },
  },
  data() {
    return {
      notCompleted: true,
      showStar: false,
    }
  },
  watch: {
    isLightboxOpen() {
      const tydeProgress = this.getTydeProgress(this.nodeId)
      if (this.notCompleted && tydeProgress == 1) {
        this.showStar = true
        this.notCompleted = false
      }
    },
  },
  computed: {
    ...mapGetters([
      "getNode",
      "getDirectChildren",
      "getDirectParents",
      "getTydeProgress",
    ]),
    ...mapState(["selectedModuleId"]),
    done() {
      return this.topics.every(topic => topic.completed)
    },
    node() {
      return this.getNode(this.nodeId)
    },
    moduleId() {
      const moduleIds = this.getDirectParents(this.nodeId).filter(
        id => this.getNode(id).tydeType === tydeTypes.MODULE
      )
      return moduleIds[0]
    },
    nodeStyles() {
      return {
        backgroundImage: `url(${this.node.imageURL})`,
      }
    },
    topics() {
      const childrenIds = this.getDirectChildren(this.nodeId)
      return childrenIds.map(id => this.getNode(id))
    },
    filteredTopics() {
      return this.node.childOrdering
        .map(topicID => this.getNode(topicID))
        .filter(topic => topic)
    },
    activeStarSrc() {
      return Helpers.getImagePath(ActiveStar)
    },
    inactiveStarSrc() {
      return Helpers.getImagePath(InactiveStar)
    },
    numComplete() {
      const reducer = (accumulator, completed) =>
        accumulator + (completed === true ? 1 : 0)
      return this.topics.map(n => n.completed).reduce(reducer, 0)
    },
    isLightboxOpen() {
      return this.$route.path.includes("nodes")
    },
  },
  mounted() {
    document.querySelector("body").classList.add("tapestry-stage-open")
    this.notCompleted = this.getTydeProgress(this.nodeId) !== 1
  },
  beforeDestroy() {
    document.querySelector("body").classList.remove("tapestry-stage-open")
  },
  methods: {
    getImageStyles(index) {
      if (index === 0 || index === 3) {
        return { width: "70%" }
      }
      return {}
    },
    openTopic(evt, id) {
      client.recordAnalyticsEvent("user", "click", "topic", id, {
        x: evt.clientX,
        y: evt.clientY,
      })
      this.openLightbox(id)
    },
    openLightbox(id) {
      client.recordAnalyticsEvent("user", "open", "topic", id)
      this.$router.push(`/nodes/${id}`)
    },
    handleClick(evt, type) {
      client.recordAnalyticsEvent("user", "click", `stage-${type}-button`, null, {
        x: evt.clientX,
        y: evt.clientY,
      })
      this.$emit(type)
    },
  },
}
</script>

<style lang="scss">
body.tapestry-stage-open {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.stage-wrapper {
  background-size: cover;
  height: 100%;
  width: 100%;
  font-family: inherit;
  color: #fff;

  .stage-header {
    display: flex;
    flex-direction: row;
    width: 100vw;
    top: 32px;
    right: 32px;
    font-family: inherit;
    align-items: center;

    .stage-star {
      margin-left: 32vw;
      margin-right: 30px;
      padding-bottom: 10px;
      position: relative;
      font-family: inherit;
      color: white;
      font-size: 1.5em;
      line-height: 2em;

      img {
        width: 80px;
      }

      > div {
        position: absolute;
        left: 27%;
        top: 24%;
      }
    }

    h1 {
      font-family: inherit;
      font-size: 3.2em;
      text-shadow: 0px 0px 1px #1c0544, 1px 1px 1px #1c0544, 1px -1px 1px #1c0544,
        -1px 1px 1px #1c0544, -1px -1px 1px #1c0544, 2px 1px 1px #1c0544,
        2px -1px 1px #1c0544, -2px 1px 1px #1c0544, -2px -2px 1px #1c0544,
        1px 2px 1px #1c0544, 1px -2px 1px #1c0544, -1px 2px 1px #1c0544,
        2px 2px 1px #1c0544;

      &::before {
        display: none;
      }
    }

    .close-button {
      position: absolute;
      top: -25px;
      right: -25px;
      z-index: 20;
    }
  }

  > div {
    width: 100vw;
    height: 72vh;
    position: absolute;
    top: 32px;
    right: 32px;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 64px;

    > section {
      margin-left: 30vw;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;

      button {
        margin: 0;
        background: none;
        color: inherit;
        align-self: flex-start;
        flex: auto;

        &:hover p {
          transform: translateY(-8px);
        }

        div {
          width: 198px;
          height: 184px;

          img {
            width: 90%;
            height: auto;
          }
        }

        p {
          padding: 0;
          margin: 0.5em 0 0;
          font-family: inherit;
          color: inherit;
          font-size: 2em;
          transition: transform 0.2s ease-out;
          line-height: 0.9em;
          max-width: 200px;
        }
      }
    }
  }

  footer {
    margin-right: 11vw;
    display: flex;
    justify-content: flex-end;
    margin-top: 80px;
  }
}
</style>
