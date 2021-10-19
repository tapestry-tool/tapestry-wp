<template>
  <headless-multi-content
    :rows="rows.map(row => row.node.id)"
    :value="rowId"
    @input="changeRow"
  >
    <template v-slot="{ isVisible, hasNext, next }">
      <div data-qa="page-rows" class="page-rows">
        <b-row>
          <template v-for="(row, index) in rows">
            <b-col
              :id="`row-${row.node.id}`"
              :key="row.node.id"
              ref="rowRefs"
              class="col"
              cols="12"
              :lg="row.node.typeData.halfWidth ? 6 : 12"
            >
              <div class="page-row">
                <div class="title-row-icon">
                  <i
                    v-if="disableRow(index, row.node)"
                    class="fas fa-lock fa-sm"
                  ></i>
                  <a
                    v-else
                    class="favourite-btn"
                    :class="{ 'is-favourite': isFavourite(row.node.id) }"
                  >
                    <i
                      v-if="canEditNode(row.node)"
                      class="fas fa-pencil-alt fa-sm pr-2"
                      :style="{
                        opacity: '0.25',
                        cursor: 'pointer',
                      }"
                      @click="editNode(row.node.id)"
                    ></i>
                    <i
                      class="fas fa-heart fa-sm"
                      @click="toggleFavourite(row.node.id)"
                    ></i>
                  </a>
                </div>
                <div v-if="disableRow(index, row.node)" class="row-content">
                  <h1 class="title">
                    {{ row.node.title }}
                  </h1>
                  <locked-content
                    :node="row.node"
                    :condition-node="index > 0 ? rows[index - 1].node : {}"
                  ></locked-content>
                </div>
                <div
                  v-else
                  :data-qa="`row-content-${row.node.id}`"
                  class="row-content"
                >
                  <div v-if="row.node.mediaType !== 'multi-content'">
                    <tapestry-media
                      :node-id="row.node.id"
                      :dimensions="dimensions"
                      context="page"
                      style="margin-bottom: 24px;"
                      @complete="updateProgress(row.node.id)"
                      @load="handleLoad($refs.rowRefs[index])"
                    />
                    <p v-if="row.children.length > 0 && !areAllPopup(row.children)">
                      {{ row.node.typeData.subAccordionText }}
                    </p>
                    <accordion-rows
                      v-if="row.children.length > 0"
                      :dimensions="dimensions"
                      :node="row.node"
                      :rowId="subRowId"
                      context="page"
                      :level="level + 1"
                      @changeRow="changeRow"
                      @load="handleLoad"
                      @updateProgress="updateProgress"
                    ></accordion-rows>
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
                <button
                  v-if="row.node.completed && isVisible(row)"
                  class="mt-2"
                  @click="hasNext ? next() : (showCompletion = true)"
                >
                  {{ node.typeData.finishButtonText }}
                </button>
              </div>
            </b-col>
          </template>
        </b-row>
      </div>
    </template>
  </headless-multi-content>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import HeadlessMultiContent from "./HeadlessMultiContent"
import AccordionRows from "./AccordionRows"
import LockedContent from "./common/LockedContent"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"

export default {
  name: "page-rows",
  components: {
    TapestryMedia,
    HeadlessMultiContent,
    MultiContentMedia: () => import("../MultiContentMedia"),
    AccordionRows,
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
  computed: {
    ...mapGetters([
      "getDirectChildren",
      "getNode",
      "isFavourite",
      "isMultiContent",
      "getTheme",
    ]),
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
  },
  watch: {
    node() {
      this.$nextTick(() => {
        this.$root.$emit("observe-rows", this.$refs.rowRefs)
      })
    },
  },
  mounted() {
    this.$root.$emit("observe-rows", this.$refs.rowRefs)
  },
  methods: {
    ...mapMutations(["updateNode", "setReturnRoute"]),
    ...mapActions(["toggleFavourite"]),
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
    changeRow(rowInfo) {
      this.$emit("changeRow", { context: this.context, ...rowInfo })
    },
    handleAutoClose() {
      this.$emit("close")
    },
    areAllPopup(nodes) {
      return nodes.every(node => node.popup !== null)
    },
    canEditNode(node) {
      return Helpers.hasPermission(node, "edit")
    },
    editNode(id) {
      this.setReturnRoute(this.$route)
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: id, type: "edit", tab: "content" },
      })
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
  background: none;
  width: 100%;
  text-align: left;
  font-size: 1.75rem;
  font-weight: 500;

  :before {
    display: none;
  }
}

.col-lg-6,
.page-rows {
  margin-right: -15px;
  overflow-x: hidden;
}
.col-lg-12 {
  max-width: calc(100% - 15px);
}

.page-row {
  position: relative;
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 16px;
  background: var(--layered-background-color);

  .title-row-icon {
    position: absolute;
    right: 12px;
    text-align: right;
  }

  .row-content {
    padding-top: 5px;
  }

  i {
    color: var(--text-color);
  }

  .favourite-btn {
    i {
      opacity: 0.25;
      cursor: pointer;
    }
    &.is-favourite > i {
      color: red;
      opacity: 1;
    }
  }
}
</style>
