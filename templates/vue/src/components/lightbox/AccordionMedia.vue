<template>
  <div ref="container" class="media-container">
    <h1 class="title">{{ node.title }}</h1>
    <accordion-row
      v-for="(row, index) in rows"
      :key="row.id"
      :visible="index === activeIndex"
    >
      <template v-slot:trigger>
        <button :disabled="lockRows && index > disabledFrom" @click="toggle(index)">
          {{ row.title }}
        </button>
      </template>
      <tapestry-media
        :node-id="row.id"
        :dimensions="dimensions"
        @complete="updateProgress(row.id)"
      />
      <button v-if="row.completed" @click="showCompletion = true">
        Finished?
      </button>
    </accordion-row>
    <tapestry-modal
      v-if="showCompletion"
      :allow-close="false"
      @close="showCompletion = false"
    >
      <h1>{{ node.typeData.confirmationTitleText }}</h1>
      <p>{{ node.typeData.confirmationBodyText }}</p>
      <div class="button-container">
        <button v-if="hasNext" class="button-completion" @click="next">
          <i class="far fa-arrow-alt-circle-right fa-4x"></i>
          <p>{{ node.typeData.continueButtonText }}</p>
        </button>
        <button class="button-completion" @click="showCompletion = false">
          <i class="far fa-times-circle fa-4x"></i>
          <p>{{ node.typeData.cancelLinkText }}</p>
        </button>
      </div>
    </tapestry-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import TapestryMedia from "../TapestryMedia"
import TapestryModal from "../TapestryModal"
import AccordionRow from "../AccordionRow"

export default {
  name: "accordion-media",
  components: {
    TapestryMedia,
    TapestryModal,
    AccordionRow,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeIndex: 0,
      showCompletion: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode"]),
    hasNext() {
      return this.activeIndex < this.rows.length - 1
    },
    rows() {
      return this.getDirectChildren(this.node.id).map(this.getNode)
    },
    dimensions() {
      const box = this.$refs.container
      if (!box) {
        return {}
      }
      const rect = box.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    },
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(node => !node.completed)
    },
  },
  methods: {
    ...mapActions(["updateNodeProgress"]),
    toggle(index) {
      if (this.activeIndex === index) {
        this.activeIndex = -1
      } else {
        this.activeIndex = index
      }
    },
    next() {
      this.showCompletion = false
      this.activeIndex++
    },
    updateProgress() {
      const numNodes = this.rows.length
      const completedSoFar = this.rows.filter(node => node.completed).length
      this.updateNodeProgress({
        id: this.node.id,
        progress: (completedSoFar + 1) / numNodes,
      })
      thisTapestryTool.updateProgressBars()
    },
  },
}
</script>

<style lang="scss" scoped>
button[disabled] {
  opacity: 0.8;
}

.title {
  color: #fff;
}

.media-container {
  height: 100%;
  overflow: scroll;
  scrollbar-color: auto black;
  scrollbar-width: none;

  ::-webkit-scrollbar-track {
    background-color: black;
  }
}

.button-completion {
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: inherit;
  margin-right: 2em;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    color: #11a6d8;
  }

  p {
    margin: 1em auto 0;
    padding: 0;
    font-weight: 600;
  }
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
