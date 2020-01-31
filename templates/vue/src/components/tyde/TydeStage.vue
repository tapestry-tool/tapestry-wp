<template>
  <div class="stage-wrapper" :style="nodeStyles">
    <div>
      <h1>{{ node.title }}</h1>
      <section>
        <button
          v-for="question in questions"
          :key="question.id"
          @click="openLightbox(question.id)"
        >
          <div>
            <img :src="question.imageURL" />
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

export default {
  name: "tyde-stage",
  props: {
    nodeId: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
    done() {
      return this.questions.every(question => question.completed)
    },
    node() {
      return this.getNode(this.nodeId)
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
