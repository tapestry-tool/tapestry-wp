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
          :key="row.node.id"
          ref="rowRefs"
          :id="`row-${row.node.id}`"
          class="page-row"
        >
          <div class="title-row">
            <div v-if="disableRow(index)" class="title">
              {{ row.node.title }}
            </div>
            <i
              v-if="disableRow(index)"
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
          <div v-if="!disableRow(index)" :data-qa="`row-content-${row.node.id}`">
            <h1 v-if="showTitle(row)" class="sub-multicontent-title">
              {{ row.node.title }}
            </h1>
            <tapestry-media
              :node-id="row.node.id"
              :dimensions="dimensions"
              context="page"
              :autoplay="false"
              style="color: white; margin-bottom: 24px;"
              @complete="updateProgress(row.node.id)"
              @load="handleLoad($refs.rowRefs[index])"
            />
            <p v-if="row.children.length > 0" style="color: white;">
              {{ row.node.typeData.subAccordionText }}
            </p>
            <sub-page
              v-if="row.children.length > 0"
              :dimensions="dimensions"
              :rows="row.children"
              :row-id="subRowId"
              @load="handleLoad"
            ></sub-page>
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
import SubPage from "./SubPage.vue"

export default {
  name: "page-rows",
  components: {
    TapestryMedia,
    HeadlessMultiContent,
    SubPage,
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
