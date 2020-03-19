<template>
  <div class="stage-wrapper" :style="nodeStyles">
    <div>
      <div class="stage-header">
        <tyde-progress-bar
          :node-id="parent.id"
          :width="200"
          :progress="parent.tydeProgress"
        />
        <div v-if="this.done" class="stage-star">
          <img :src="this.activeStarSrc" />
        </div>
        <div v-else class="stage-star">
          <img :src="this.inactiveStarSrc" />
          <div>{{ this.numComplete }}/{{ this.questions.length }}</div>
        </div>
        <h1>{{ node.title + " " + parent.tydeProgress }}</h1>
      </div>
      <section>
        <button
          v-for="question in questions"
          :key="question.id"
          @click="openLightbox(question.id)"
        >
          <div>
            <img :src="question.imageURL" />
            <i v-if="question.completed" class="fas fa-check fa-3x"></i>
          </div>
          <p>{{ question.title }}</p>
        </button>
      </section>
      <footer>
        <button v-if="done" @click="$emit('next')">
          Next
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TydeProgressBar from "./TydeProgressBar"
import ActiveStar from "@/assets/star-active.png"
import InactiveStar from "@/assets/star-inactive.png"
import Helpers from "@/utils/Helpers"
import { tydeTypes } from "@/utils/constants"

export default {
  name: "tyde-stage",
  components: {
    TydeProgressBar,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren", "getDirectParents"]),
    done() {
      return this.questions.every(question => question.completed)
    },
    node() {
      return this.getNode(this.nodeId)
    },
    module() {
      const moduleIds = this.getDirectParents(this.nodeId).filter(
        id => this.getNode(id).tydeType === tydeTypes.MODULE
      )
      return this.getNode(moduleIds[0])
    },
    nodeStyles() {
      return {
        backgroundImage: `url(${this.node.imageURL})`,
      }
    },
    questions() {
      const childrenIds = this.getDirectChildren(this.nodeId)
      return childrenIds.map(id => this.getNode(id))
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
      return this.questions.map(n => n.completed).reduce(reducer, 0)
    },
  },
  mounted() {
    document.querySelector("body").classList.add("tapestry-stage-open")
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
    openLightbox(id) {
      this.$router.push(`/nodes/${id}`)
    },
    closeLightbox() {
      this.$router.push(`/`)
    },
  },
}
</script>

<style>
:root {
  --tyde-green: #205a27;
  --tyde-border-green: #39b54a;
}

body.tapestry-stage-open {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.stage-wrapper {
  background-size: cover;
  height: 100%;
  width: 100%;

  .stage-header {
    display: flex;
    flex-direction: row;
    width: 100vw;
    top: 32px;
    right: 32px;
    font-family: "VT323", monospace;
    color: var(--tyde-border-green);
    align-items: center;

    .stage-star {
      margin-left: 25vw;
      margin-right: 30px;
      padding-bottom: 10px;
      position: relative;
      font-family: inherit;
      color: white;
      font-size: 32px;

      img {
        width: 80px;
      }

      > div {
        position: absolute;
        left: 25%;
        top: 23%;
      }
    }

    h1 {
      font-family: inherit;
      font-size: 64px;

      &::before {
        display: none;
      }
    }
  }

  > div {
    width: 100vw;
    height: 72vh;
    position: absolute;
    top: 32px;
    right: 32px;
    font-family: "VT323", monospace;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 64px;
    color: var(--tyde-border-green);

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

        &:hover p {
          transform: translateY(-8px);
        }

        div {
          width: 198px;
          height: 184px;

          i {
            position: relative;
            right: -75px;
            bottom: 30px;
            -webkit-text-stroke-width: 1px;
            -webkit-text-stroke-color: white;
          }

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
          font-size: 32px;
          transition: transform 0.2s ease-out;
          line-height: 0.9em;
          max-width: 200px;
        }
      }
    }
  }

  footer {
    margin-left: 30vw;
    display: flex;
    justify-content: flex-end;

    button {
      background: none;
      margin: 0;
      padding: 0;

      font-family: inherit;
      font-size: 2.5em;
      color: inherit;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
