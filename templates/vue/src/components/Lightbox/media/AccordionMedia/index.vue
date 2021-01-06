<template>
  <div ref="container" class="media-container" data-qa="accordion">
    <header>
      <h1 class="title">{{ node.title }}</h1>
    </header>
    <headless-accordion
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
            class="accordion-row"
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
            <div
              v-if="isVisible(row.node.id)"
              :data-qa="`row-content-${row.node.id}`"
            >
              <tapestry-media
                :node-id="row.node.id"
                :dimensions="dimensions"
                context="accordion"
                :autoplay="false"
                style="color: white; margin-bottom: 24px;"
                @complete="updateProgress(row.node.id)"
                @close="toggle(row.node.id)"
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
    <tapestry-modal
      v-if="showCompletion"
      :node-id="node.id"
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
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import TapestryModal from "../../TapestryModal"
import HeadlessAccordion from "./HeadlessAccordion"
import SubAccordion from "./SubAccordion"
import { names } from "@/config/routes"

export default {
  name: "accordion-media",
  components: {
    TapestryMedia,
    TapestryModal,
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
  },
  data() {
    return {
      showCompletion: false,
      isMounted: false,
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
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "updateNodeProgress", "toggleFavourite"]),
    handleLoad(el) {
      this.$nextTick(() => {
        if (this.activeIndex < 0) {
          this.$refs.container.scrollTop = 0
        } else {
          this.$refs.container.scrollTop = el.offsetTop - 12
        }
      })
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
