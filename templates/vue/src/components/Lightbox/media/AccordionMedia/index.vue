<template>
  <div ref="container" class="media-container accordion" data-qa="accordion">
    <header class="header" :style="headerBackground">
      <h1 class="title">{{ node.title }}</h1>
      <img :src="node.imageURL" />
    </header>
    <headless-accordion
      :rows="rows.map(row => row.node.id)"
      :value="rowId"
      @input="changeRow"
    >
      <template v-slot="{ isVisible, hasNext, next, toggle }">
        <div class="rows" data-qa="accordion-rows">
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
                <div class="button-row-icon">
                  <i :class="isVisible(row) ? 'fas fa-minus' : 'fas fa-plus'"></i>
                </div>
                <div>
                  <p class="button-row-title">{{ row.node.title }}</p>
                  <p class="button-row-description">{{ row.node.description }}</p>
                </div>
              </button>
              <div class="icon-container">
                <tyde-icon
                  v-if="showActivityIcon(row.node.mediaType)"
                  class="icon icon-activity"
                  icon="activity"
                ></tyde-icon>
                <tyde-icon
                  v-if="row.node.completed"
                  class="icon"
                  icon="checkmark"
                ></tyde-icon>
                <tyde-icon
                  v-if="disableRow(index)"
                  class="icon"
                  icon="lock"
                ></tyde-icon>
                <a
                  v-if="!disableRow(index)"
                  :disabled="readOnly"
                  @click="toggleFavourite(row.node.id)"
                >
                  <i
                    v-if="isFavourite(row.node.id)"
                    class="fas fa-heart fa-lg"
                    style="color:red;"
                  ></i>
                  <i v-else class="fas fa-heart fa-lg" style="color:white;"></i>
                </a>
              </div>
            </div>
            <div
              v-if="isVisible(row.node.id)"
              class="content"
              :data-qa="`row-content-${row.node.id}`"
            >
              <tapestry-media
                :node-id="row.node.id"
                :dimensions="dimensions"
                context="accordion"
                :autoplay="false"
                :read-only="readOnly"
                style="margin-bottom: 24px;"
                @complete="updateProgress(row.node.id)"
                @close="toggle(row.node.id)"
                @load="handleLoad($refs.rowRefs[index])"
              />
              <p v-if="row.children.length > 0" class="sub-accordion-text">
                {{ row.node.typeData.subAccordionText }}
              </p>
              <sub-accordion
                v-if="row.children.length > 0"
                :rows="row.children"
                :read-only="readOnly"
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
      :show-fav="false"
      :content-container-style="confirmationStyles"
      @close="handleCancel"
    >
      <tyde-progress-bar
        v-if="moduleOpened"
        class="modal-progress"
        :node-id="selectedModuleId"
      />
      <div class="button-container">
        <button class="button-completion" @click="handleClose">
          {{ node.typeData.continueButtonText }}
        </button>
        <button class="button-completion" @click="handleCancel">
          {{ node.typeData.cancelLinkText }}
        </button>
      </div>
    </tapestry-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import TapestryModal from "@/components/common/TapestryModal"
import HeadlessAccordion from "@/components/common/HeadlessAccordion"
import SubAccordion from "./SubAccordion"
import TydeProgressBar from "@/components/tyde/common/TydeProgressBar"
import TydeIcon from "@/components/tyde/common/TydeIcon"
import Helpers from "@/utils/Helpers"
import AccordionHeader from "@/assets/accordion-header.png"
import AccordionConfirmation from "@/assets/accordion-confirmation.png"
import client from "@/services/TapestryAPI"
import { names } from "@/config/routes"

export default {
  name: "accordion-media",
  components: {
    TapestryMedia,
    TapestryModal,
    HeadlessAccordion,
    SubAccordion,
    TydeIcon,
    TydeProgressBar,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
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
    ...mapState(["selectedModuleId", "favourites"]),
    confirmationStyles() {
      return {
        backgroundColor: "white",
        backgroundImage: `url(${Helpers.getImagePath(AccordionConfirmation)})`,
        backgroundOrigin: "content-box",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        padding: "32px 64px",
        top: "150px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "800px",
        height: "500px",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
      }
    },
    headerBackground() {
      return { backgroundImage: `url(${Helpers.getImagePath(AccordionHeader)})` }
    },
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
    moduleOpened() {
      return this.selectedModuleId !== null
    },
    progress() {
      const rows = this.getDirectChildren(this.node.id)
      return rows.map(this.getNode).filter(row => row.completed).length / rows.length
    },
  },
  watch: {
    progress(val) {
      if (val >= 1) {
        this.$emit("complete")
      }
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
      if (this.node.userType === "teen") {
        return false
      }
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
    },
    updateProgress(rowId) {
      const row = this.getNode(rowId)
      if (Helpers.canUserUpdateProgress(row) && !this.readOnly) {
        this.completeNode(rowId)
      }
    },
    showActivityIcon(mediaType) {
      return mediaType === "gravity-form" || mediaType === "activity"
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
