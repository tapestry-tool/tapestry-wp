<template>
  <headless-accordion
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
          class="accordion-row"
        >
          <div class="button-row">
            <a v-if="!disableRow(index)" @click="toggleFavourite(row.node.id)">
              <i
                v-if="isFavourite(row.node.id)"
                class="fas fa-heart fa-sm"
                style="color:red;"
              ></i>
              <i v-else class="fas fa-heart fa-sm" style="color:white;"></i>
            </a>
          </div>
          <div :data-qa="`row-content-${row.node.id}`">
            <tapestry-media
              :node-id="row.node.id"
              :dimensions="dimensions"
              context="accordion"
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
  </headless-accordion>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import HeadlessAccordion from "./HeadlessAccordion"
import SubAccordion from "./SubAccordion"

export default {
  name: "page-rows",
  components: {
    TapestryMedia,
    HeadlessAccordion,
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
  },
  data() {
    return {
      showCompletion: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isFavourite", "isAccordion"]),
    ...mapState(["favourites"]),
    rows() {
      return this.node.childOrdering.map(id => {
        const node = this.getNode(id)
        const children = this.isAccordion(node.id)
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
}
</style>
