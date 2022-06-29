<template>
  <div
    ref="container"
    class="media-container"
    :style="navBarStyle"
    data-qa="multi-content"
  >
    <header>
      <h1
        v-if="showTitle"
        :class="{
          title: true,
          'nested-media-title': context === 'multi-content',
        }"
      >
        {{ node.title }}
        <completed-icon :node="node" class="mx-2" />
      </h1>
    </header>
    <template v-if="node.presentationStyle">
      <div v-if="node.presentationStyle === 'unit'">
        The content of this unit has not been unlocked yet.
      </div>
      <div v-else-if="!node.accessible">
        <locked-content :node="node"></locked-content>
      </div>
      <multi-content-rows
        v-else
        :dimensions="dimensions"
        :node="node"
        :rowId="rowId"
        :context="context"
        :level="level"
        @load="$emit('load')"
        @change-row="changeRow"
        @complete="complete"
      />
    </template>
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
import CompletedIcon from "@/components/common/CompletedIcon"
import LockedContent from "./common/LockedContent"
import TapestryModal from "../../TapestryModal"
import MultiContentRows from "./MultiContentRows"
import { names } from "@/config/routes"

export default {
  name: "multi-content-media",
  components: {
    CompletedIcon,
    LockedContent,
    TapestryModal,
    MultiContentRows,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    rowId: {
      type: Number,
      required: false,
      default: 0,
    },
    context: {
      type: String,
      required: false,
      default: "",
    },
    level: {
      type: Number,
      required: false,
      default: 0,
    },
    hideTitle: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      activeIndex: -1,
      showCompletion: false,
      isMounted: false,
      navBarStyle: {},
    }
  },
  computed: {
    ...mapGetters([
      "getDirectChildren",
      "getNode",
      "getParent",
      "isFavourite",
      "isMultiContent",
    ]),
    ...mapState(["favourites", "rootId"]),
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
    showTitle() {
      return (
        !this.hideTitle &&
        (this.level == 0 || this.node.typeData.showTitle !== false)
      )
    },
  },
  mounted() {
    this.isMounted = true
    this.activeIndex = this.node.presentationStyle === "page" ? -1 : 0

    // if all children are completed, mark this as completed too
    // this is just in case it hasn't done this properly before
    if (!this.node.completed && this.rows.every(row => row.node.completed)) {
      this.$emit("complete", this.node.id)
    }
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "toggleFavourite"]),
    handleClose(evt) {
      client.recordAnalyticsEvent("user", "close", "multi-content", this.node.id, {
        x: evt.clientX,
        y: evt.clientY,
      })
      this.$emit("close")
    },
    handleCancel(evt) {
      client.recordAnalyticsEvent(
        "user",
        "close",
        "multi-content-completion-screen",
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
    complete(rowId) {
      const completeMultiContentNode = () => {
        if (
          !this.node.completed &&
          this.rows.every(
            row => row.node.completed || row.node.title === "Resources"
          )
        ) {
          this.$emit("complete", this.node.id)
        }
      }
      const rowIndex = this.rows.findIndex(row => row.node.id == rowId)
      if (!this.rows[rowIndex].node.completed) {
        this.completeNode(rowId).then(completeMultiContentNode)
      } else {
        completeMultiContentNode()
      }
    },
    changeRow(rowInfo) {
      const { rowId } = rowInfo
      if (rowId) {
        this.$router.push({
          name: names.LIGHTBOX,
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
  margin-bottom: 1em;
}

.media-container {
  height: 100%;
  width: 100%;
  max-width: 150vh;
  margin: 0 auto;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-color: auto var(--text-color-primary);
  scrollbar-width: none;

  ::-webkit-scrollbar-track {
    background-color: black;
  }
}

.nested-media-title {
  text-align: left;
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 0.9em 0 0.5em 25px;
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
    color: var(--highlight-color);
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
