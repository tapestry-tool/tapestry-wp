<template>
  <headless-multi-content
    :rows="rows.map(row => row.node.id)"
    :value="rowId"
    @input="changeRow"
  >
    <template v-slot="{ isVisible, hasNext, next, toggle }">
      <div data-qa="accordion-rows">
        <div
          v-for="(row, index) in nonPopupRows"
          :key="row.node.id"
          ref="rowRefs"
          class="accordion-row"
        >
          <div class="button-row">
            <button
              class="trigger-row-btn"
              :disabled="disableRow(index, row.node)"
              @click="toggle(row.node.id)"
            >
              <i
                v-if="!disableRow(index, row.node)"
                :class="isVisible(row.node.id) ? 'fas fa-minus' : 'fas fa-plus'"
              ></i>
              <i v-else class="fas fa-lock fa-sm title-row-ico"></i>
              {{ row.node.title }}
              <locked-content
                v-if="disableRow(index, row.node)"
                :node="row.node"
                :condition-node="index > 0 ? nonPopupRows[index - 1].node : {}"
              ></locked-content>
            </button>
            <a v-if="canEditNode(row.node)" @click="editNode(row.node.id)">
              <i class="fas fa-pencil-alt fa-sm pr-2"></i>
            </a>
            <a
              v-if="!disableRow(index, row.node)"
              class="favourite-btn"
              :class="{ 'is-favourite': isFavourite(row.node.id) }"
              @click="toggleFavourite(row.node.id)"
            >
              <i class="fas fa-heart fa-sm"></i>
            </a>
          </div>
          <div v-if="isVisible(row.node.id)" :data-qa="`row-content-${row.node.id}`">
            <div v-if="row.node.mediaType !== 'multi-content'">
              <tapestry-media
                :node-id="row.node.id"
                :dimensions="dimensions"
                context="multi-content"
                style="margin-bottom: 24px;"
                @complete="updateProgress(row.node.id)"
                @close="toggle(row.node.id)"
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
                context="accordion"
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
              context="accordion"
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
  name: "accordion-rows",
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
      "getParent",
      "isFavourite",
      "isMultiContent",
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
    nonPopupRows() {
      return this.rows.filter(row => row.node.popup === null)
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

.accordion-row {
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 8px;
  background: var(--bg-color-layered);

  i {
    cursor: pointer;
    color: var(--text-color-primary);
    opacity: 0.25;
  }
  a:hover,
  a:active {
    i {
      opacity: 1;
    }
  }

  .trigger-row-btn {
    background: none;
    color: var(--text-color-primary);
    width: 100%;
    text-align: left;
    i {
      opacity: 1;
    }
  }

  .favourite-btn {
    &.is-favourite > i {
      color: red;
      opacity: 1;
    }
  }
}
</style>
