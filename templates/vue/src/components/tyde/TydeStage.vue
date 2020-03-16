<template>
  <div class="stage-wrapper" :style="nodeStyles">
    <div>
      <h1>{{ node.title }}</h1>
      <section>
        <tyde-topic
          v-for="topic in topics"
          :key="topic.id"
          :topic="topic"
          style="align-self: flex-start;"
          @click="openLightbox(topic.id)"
        />
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
import TydeTopic from "./TydeTopic"

export default {
  name: "tyde-stage",
  components: {
    TydeTopic,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
    done() {
      return this.topics.every(question => question.completed)
    },
    node() {
      return this.getNode(this.nodeId)
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
body.tapestry-stage-open {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.stage-wrapper {
  background-size: cover;
  height: 100%;
  width: 100%;

  > div {
    width: 70vw;
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

    h1 {
      font-family: inherit;
      font-size: 64px;

      &::before {
        display: none;
      }
    }

    > section {
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
