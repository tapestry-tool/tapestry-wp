<template>
  <headless-multi-content
    :rows="rows.map(row => row.node.id)"
    :value="rowId"
    @input="changeRow"
  >
    <template v-slot="{ isVisible, hasNext, next, toggle }">
      <div data-qa="accordion-rows">
        <div
          v-for="(row, index) in rows"
          :key="row.node.id"
          ref="rowRefs"
          :class="{
            'accordion-row': true,
            'nested-accordion-row':
              isMultiContentContext && node.mediaType == 'multi-content',
          }"
        >
          <div class="button-row">
            <button
              class="button-row-trigger"
              :disabled="disableRow(index)"
              @click="toggle(row.node.id)"
            >
              <i
                :class="isVisible(row.node.id) ? 'fas fa-minus' : 'fas fa-plus'"
              ></i>
              {{ row.node.title }}
            </button>
            <a v-if="!disableRow(index)" @click="toggleFavourite(row.node.id)">
              <i
                v-if="isFavourite(row.node.id)"
                class="fas fa-heart fa-sm"
                style="color:red;"
              ></i>
              <i v-else class="fas fa-heart fa-sm" style="color:white;"></i>
            </a>
          </div>
          <div v-if="isVisible(row.node.id)" :data-qa="`row-content-${row.node.id}`">
            <h1 v-if="showTitle(row)" class="sub-multicontent-title">
              {{ row.node.title }}
            </h1>
            <tapestry-media
              :node-id="row.node.id"
              :dimensions="dimensions"
              context="multi-content"
              :autoplay="false"
              style="color: white; margin-bottom: 24px;"
              @complete="updateProgress(row.node.id)"
              @close="toggle(row.node.id)"
              @load="handleLoad($refs.rowRefs[index])"
            />
            <p v-if="row.children.length > 0 && row.node.mediaType !== 'multi-content'" style="color: white;">
              {{ row.node.typeData.subAccordionText }}
            </p>
            <sub-page
              v-if="row.children.length > 0 && row.node.presentationStyle === 'page'"
              :dimensions="dimensions"
              :rows="row.children"
              :row-id="subRowId"
              @load="handleLoad"
            ></sub-page>
            <sub-accordion
              v-else-if="row.children.length > 0"
              :dimensions="dimensions"
              :rows="row.children"
              :row-id="subRowId"
              @load="handleLoad"
            ></sub-accordion>
          </div>
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
import SubPage from "./SubPage"
import SubAccordion from "./SubAccordion"

export default {
  name: "accordion-rows",
  components: {
    TapestryMedia,
    HeadlessMultiContent,
    SubPage,
    SubAccordion,
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
  },
  data() {
    return {
      showCompletion: false,
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
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
    isMultiContentContext() {
      return this.context === "multi-content" || this.context === "page"
    },
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "updateNodeProgress", "toggleFavourite"]),
    handleLoad(el) {
      this.$emit("load", el)
    },
    disableRow(index) {
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
    },
    updateProgress(rowId) {
      this.$emit("updateProgress", rowId)
    },
    changeRow(rowId) {
      this.$emit("changeRow", rowId)
    },
    showTitle(row) {
      return (
        this.node.presentationStyle === "page" &&
        row.node.mediaType === "multi-content" &&
        row.node.typeData.showTitle !== false
      )
    },
  },
}
</script>

<style lang="scss" scoped>
button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-row {
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;
  border-radius: 4px;

  i {
    margin-right: 8px;
  }

  a {
    cursor: pointer;
  }
}

.button-row-trigger {
  background: none;
  width: 100%;
  text-align: left;
}

.accordion-row {
  background: #262626;
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &.nested-accordion-row {
    background: rgb(30, 30, 30) !important;
  }
}

.sub-multicontent-title {
  text-align: left;
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 0.9em;
  color: white;

  :before {
    display: none;
  }
}
</style>
