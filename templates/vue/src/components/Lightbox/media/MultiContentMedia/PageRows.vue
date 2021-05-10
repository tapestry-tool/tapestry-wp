<template>
  <headless-multi-content
    :rows="rows.map(row => row.node.id)"
    :value="rowId"
    @input="changeRow"
  >
    <template v-slot="{ isVisible, hasNext, next }">
      <div data-qa="page-rows">
        <div
          v-for="(row, index) in rows"
          :id="`row-${row.node.id}`"
          :key="row.node.id"
          ref="rowRefs"
          class="page-row"
          :style="rowBackground"
        >
          <div class="title-row">
            <div v-if="disableRow(index, row.node)" class="title">
              {{ row.node.title }}
            </div>
            <i
              v-if="disableRow(index, row.node)"
              class="fas fa-lock fa-sm title-row-icon"
              style="color:white;"
            ></i>
            <a v-else class="title-row-icon">
              <i
                v-if="isFavourite(row.node.id)"
                class="fas fa-heart fa-sm"
                style="color:red; cursor:pointer;"
                @click="toggleFavourite(row.node.id)"
              ></i>
              <i
                v-else
                class="fas fa-heart fa-sm"
                style="color:white; cursor:pointer;"
                @click="toggleFavourite(row.node.id)"
              ></i>
            </a>
          </div>
          <div
            v-if="!disableRow(index, row.node)"
            :data-qa="`row-content-${row.node.id}`"
          >
            <div v-if="row.node.mediaType !== 'multi-content'">
              <tapestry-media
                :node-id="row.node.id"
                :dimensions="dimensions"
                :hasNext="hasNext"
                context="page"
                :autoplay="false"
                style="color: white; margin-bottom: 24px;"
                @complete="updateProgress(row.node.id)"
                @load="handleLoad($refs.rowRefs[index])"
              />
              <p v-if="row.children.length > 0" style="color: white;">
                {{ row.node.typeData.subAccordionText }}
              </p>
              <sub-accordion
                v-if="row.children.length > 0"
                :dimensions="dimensions"
                :rows="row.children"
                :row-id="subRowId"
                @load="handleLoad"
                @input="changeRow"
              />
            </div>
            <multi-content-media
              v-else-if="row.children.length > 0"
              :node="getNode(row.node.id)"
              :row-id="subRowId"
              context="page"
              :level="level + 1"
              @close="handleAutoClose"
              @complete="updateProgress"
            />
          </div>
          <locked-content v-else :node="row.node"></locked-content>
          <button
            v-if="row.node.completed && isVisible(row)"
            class="mt-2"
            @click="hasNext ? next() : (showCompletion = true)"
          >
            {{ node.typeData.finishButtonText }}
          </button>
        </div>
      </div>
    </template>
  </headless-multi-content>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import HeadlessMultiContent from "./HeadlessMultiContent"
import SubAccordion from "./SubAccordion"
import LockedContent from "./common/LockedContent"

export default {
  name: "page-rows",
  components: {
    TapestryMedia,
    HeadlessMultiContent,
    MultiContentMedia: () => import("../MultiContentMedia"),
    SubAccordion,
    LockedContent,
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
    dimensions: {
      type: Object,
      required: true,
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
  },
  data() {
    return {
      showCompletion: false,
    }
  },
  mounted() {
    this.$root.$emit("observe-rows", this.$refs.rowRefs)
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
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
    isMultiContentContext() {
      return (
        this.context === "multi-content" ||
        this.context === "page" ||
        this.context === "accordion"
      )
    },
    rowBackground() {
      if (this.isMultiContentContext) {
        let rgb = 40
        let colorOffset = this.level * 10
        rgb = colorOffset > rgb ? 0 : rgb - colorOffset
        return {
          background: `rgb(${rgb}, ${rgb}, ${rgb})`,
        }
      } else {
        return null
      }
    },
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "updateNodeProgress", "toggleFavourite"]),
    handleLoad(el) {
      this.$emit("load", el)
    },
    disableRow(index, node) {
      return (
        (this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom) ||
        !node.unlocked
      )
    },
    updateProgress(rowId) {
      this.$emit("updateProgress", rowId)
    },
    changeRow(rowId) {
      this.$emit("changeRow", rowId)
    },
    handleAutoClose() {
      this.$emit("close")
    },
  },
}
</script>

<style lang="scss" scoped>
button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.title-row {
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;
  border-radius: 4px;
}

.title-row-icon {
  flex: 1;
  text-align: right;
}

.title {
  background: none;
  width: 100%;
  text-align: left;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.page-row {
  background: #262626;
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
