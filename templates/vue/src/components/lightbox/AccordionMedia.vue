<template>
  <div ref="container" class="media-container">
    <h1 class="title">{{ node.title }}</h1>
    <accordion-row
      v-for="(row, index) in rows"
      :key="row.node.id"
      ref="rowRefs"
      :visible="index === activeIndex"
    >
      <template v-slot:trigger>
        <button
          class="button-row"
          :disabled="lockRows && disabledFrom >= 0 && index > disabledFrom"
          @click="toggle(index)"
        >
          <i :class="index === activeIndex ? 'fas fa-minus' : 'fas fa-plus'"></i>
          {{ row.node.title }}
        </button>
      </template>
      <template v-slot:content>
        <tapestry-media
          :node-id="row.node.id"
          :dimensions="dimensions"
          :autoplay="false"
          style="color: white; margin-bottom: 24px;"
          @complete="updateProgress(row.node.id)"
          @close="toggle(index)"
          @load="handleLoad"
        />
        <p v-if="row.children.length > 0" style="color: white;">
          {{ row.node.typeData.subAccordionText }}
        </p>
        <sub-accordion
          v-if="row.children.length > 0"
          :rows="row.children"
        ></sub-accordion>
      </template>
      <template v-slot:footer>
        <button v-if="row.node.completed" class="mt-2" @click="next">
          {{ node.typeData.finishButtonText }}
        </button>
      </template>
    </accordion-row>
    <tapestry-modal
      v-if="showCompletion"
      :allow-close="false"
      @close="showCompletion = false"
    >
      <h1>{{ node.typeData.confirmationTitleText }}</h1>
      <p>{{ node.typeData.confirmationBodyText }}</p>
      <div class="button-container">
        <button class="button-completion" @click="$emit('close')">
          <i class="far fa-arrow-alt-circle-right fa-4x"></i>
          <p>{{ node.typeData.continueButtonText }}</p>
        </button>
        <button class="button-completion" @click="showCompletion = false">
          <i class="far fa-times-circle fa-4x"></i>
          <p>{{ node.typeData.cancelLinkText }}</p>
        </button>
      </div>
    </tapestry-modal>
    <button class="button-scroll-top" @click="scrollToTop">
      <i class="fas fa-chevron-up fa-2x"></i>
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import TapestryModal from "../TapestryModal"
import AccordionRow from "../AccordionRow"
import SubAccordion from "./accordion/SubAccordion"

export default {
  name: "accordion-media",
  components: {
    TapestryMedia,
    TapestryModal,
    AccordionRow,
    SubAccordion,
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
      isMounted: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode"]),
    hasNext() {
      return this.activeIndex < this.rows.length - 1
    },
    rows() {
      const children = this.getDirectChildren(this.node.id).map(this.getNode)
      return children.map(node => ({
        node,
        children: this.getDirectChildren(node.id).map(this.getNode),
      }))
    },
    dimensions() {
      if (!this.isMounted) {
        return {
          height: 0,
          width: 0,
        }
      }
      const box = this.$refs.container
      const rect = box.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    },
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
  },
  mounted() {
    this.isMounted = true
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "updateNodeProgress"]),
    handleLoad() {
      this.$nextTick(() => {
        if (this.activeIndex < 0) {
          this.$refs.container.scrollTop = 0
        } else {
          const ref = this.$refs.rowRefs[this.activeIndex].$el
          this.$refs.container.scrollTop = ref.offsetTop - 12
        }
      })
    },
    scrollToTop() {
      const el = this.$refs.container
      if (el) {
        el.scrollTop = 0
      }
    },
    toggle(index) {
      if (this.activeIndex === index) {
        this.activeIndex = -1
      } else {
        this.activeIndex = index
      }
    },
    next() {
      if (this.hasNext) {
        this.activeIndex++
      } else {
        this.showCompletion = true
      }
    },
    async updateProgress(rowId) {
      const { accordionProgress } = this.node
      if (!accordionProgress.includes(rowId)) {
        accordionProgress.push(rowId)
        await this.completeNode(rowId)

        this.updateNodeProgress({
          id: this.node.id,
          progress: accordionProgress.length / this.rows.length,
        })
        this.updateNode({
          id: this.node.id,
          newNode: { accordionProgress },
        })

        if (accordionProgress.length === this.rows.length) {
          this.$emit("complete")
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.title {
  color: #fff;
  margin-bottom: 1em;
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

.button-row {
  display: flex;
  align-items: center;
  background: none;
  margin: 0;
  width: 100%;
  border-radius: 4px;
  text-align: left;

  i {
    margin-right: 8px;
  }
}

.button-scroll-top {
  cursor: pointer;
  position: absolute;
  right: 24px;
  bottom: 24px;
  background: #262626;
  border-radius: 50%;
  padding: 0;
  width: 56px;
  height: 56px;
  z-index: 10;
}
</style>
