<template>
  <div ref="container" class="media-container" data-qa="accordion">
    <header>
      <h1 class="title">{{ node.title }}</h1>
    </header>
    <accordion-rows
      v-if="node.presentationStyle === 'accordion'"
      :dimensions="dimensions"
      :node="node"
      :rowId="rowId"
      :subRowId="subRowId"
      @load="handleLoad"
      @changeRow="changeRow"
      @updateProgress="updateProgress"
    ></accordion-rows>
    <page-rows
      v-else-if="node.presentationStyle === 'page'"
      :dimensions="dimensions"
      :node="node"
      :rowId="rowId"
      :subRowId="subRowId"
      @load="handleLoad"
      @changeRow="changeRow"
      @updateProgress="updateProgress"
    ></page-rows>
    <tapestry-modal
      v-if="showCompletion"
      :node-id="node.id"
      :allow-close="false"
      @close="handleCancel"
    >
      <h1>{{ node.typeData.confirmationTitleText }}</h1>
      <p>{{ node.typeData.confirmationBodyText }}</p>
      <div class="button-container">
        <button class="button-completion" @click="handleClose">
          <i class="far fa-arrow-alt-circle-right fa-4x"></i>
          <p>{{ node.typeData.continueButtonText }}</p>
        </button>
        <button class="button-completion" @click="handleCancel">
          <i class="far fa-times-circle fa-4x"></i>
          <p>{{ node.typeData.cancelLinkText }}</p>
        </button>
      </div>
    </tapestry-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"
import client from "@/services/TapestryAPI"
import TapestryModal from "../../TapestryModal"
import AccordionRows from "./AccordionRows"
import PageRows from "./PageRows"
import { names } from "@/config/routes"

export default {
  name: "multi-content-media",
  components: {
    TapestryModal,
    AccordionRows,
    PageRows,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    rowId: {
      type: Number,
      required: true,
    },
    subRowId: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      activeIndex: -1,
      showCompletion: false,
      isMounted: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isFavourite", "isMultiContent"]),
    ...mapState(["favourites"]),
    rows() {
      return this.node.childOrdering.map(id => {
        const node = this.getNode(id)
        const children = this.isMultiContent(node.id)
          ? node.childOrdering.map(this.getNode)
          : this.getDirectChildren(id).map(this.getNode)
        return { node, children }
      })
    },
    dimensions() {
      if (!this.isMounted) {
        return {
          width: 0,
          height: 0,
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
    this.activeIndex = this.node.presentationStyle === "page" ? -1 : 0
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "updateNodeProgress", "toggleFavourite"]),
    handleLoad(el) {
      this.$nextTick(() => {
        if (this.activeIndex < 0) {
          client.recordAnalyticsEvent("app", "scroll", "accordion", this.node.id, {
            to: 0,
          })
          this.$refs.container.scrollTop = 0
        } else {
          client.recordAnalyticsEvent("app", "scroll", "accordion", this.node.id, {
            to: el.offsetTop - 12,
          })
          this.$refs.container.scrollTop = el.offsetTop - 12
        }
      })
    },
    scrollToTop() {
      const el = this.$refs.container
      if (el) {
        client.recordAnalyticsEvent("app", "scroll", "accordion", this.node.id, {
          to: 0,
        })
        el.scrollTop = 0
      }
    },
    handleClose(evt) {
      client.recordAnalyticsEvent("user", "close", "accordion", this.node.id, {
        x: evt.clientX,
        y: evt.clientY,
      })
      this.$emit("close")
    },
    handleCancel(evt) {
      client.recordAnalyticsEvent(
        "user",
        "close",
        "accordion-completion-screen",
        this.node.id,
        {
          x: evt.clientX,
          y: evt.clientY,
        }
      )
      this.showCompletion = false
    },
    disableRow(index) {
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
    },
    updateProgress(rowId) {
      this.completeNode(rowId)
      if (this.rows.every(row => row.node.completed)) {
        this.$emit("complete")
      }
    },
    changeRow(rowId) {
      if (rowId) {
        this.$router.push({
          name: names.ACCORDION,
          params: { nodeId: this.node.id, rowId },
          query: this.$route.query,
        })
      } else {
        this.$router.push({
          name: names.LIGHTBOX,
          params: { nodeId: this.node.id },
          query: this.$route.query,
        })
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
  overflow: auto;
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
