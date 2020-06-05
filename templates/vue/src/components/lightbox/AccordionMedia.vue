<template>
  <div ref="container" class="media-container">
    <header class="header" :style="headerBackground">
      <h1 class="title">{{ node.title }}</h1>
      <img :src="node.imageURL" />
    </header>
    <tapestry-accordion :rows="rows">
      <template v-slot="{ isVisible, hasNext, next, toggle }">
        <div class="rows">
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
                @click="toggle(row)"
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
            <div v-if="isVisible(row)" class="content">
              <tapestry-media
                :node-id="row.node.id"
                :dimensions="dimensions"
                :autoplay="false"
                :read-only="readOnly"
                style="margin-bottom: 24px;"
                @complete="updateProgress(row.node.id)"
                @close="toggle(row)"
                @load="handleLoad($refs.rowRefs[index])"
              />
              <p v-if="row.children.length > 0" class="sub-accordion-text">
                {{ row.node.typeData.subAccordionText }}
              </p>
              <sub-accordion
                v-if="row.children.length > 0"
                :rows="row.children"
                :read-only="readOnly"
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
    </tapestry-accordion>
    <tapestry-modal
      v-if="showCompletion"
      :node-id="node.id"
      :allow-close="false"
      :show-fav="false"
      :content-container-style="confirmationStyles"
      @close="showCompletion = false"
    >
      <tyde-progress-bar
        v-if="moduleOpened"
        class="modal-progress"
        :node-id="selectedModuleId"
      />
      <div class="button-container">
        <button class="button-completion" @click="$emit('close')">
          {{ node.typeData.continueButtonText }}
        </button>
        <button class="button-completion" @click="showCompletion = false">
          {{ node.typeData.cancelLinkText }}
        </button>
      </div>
    </tapestry-modal>
    <button class="button-scroll-top" @click="scrollToTop">
      <i class="fas fa-chevron-up"></i>
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from "vuex"
import TapestryMedia from "../TapestryMedia"
import TapestryModal from "../TapestryModal"
import TapestryAccordion from "../TapestryAccordion"
import TydeProgressBar from "../tyde/TydeProgressBar"
import TydeIcon from "../tyde/TydeIcon"
import Helpers from "../../utils/Helpers"
import AccordionHeader from "../../assets/accordion-header.png"
import AccordionConfirmation from "../../assets/accordion-confirmation.png"
import SubAccordion from "./accordion/SubAccordion"

export default {
  name: "accordion-media",
  components: {
    TapestryMedia,
    TapestryModal,
    TapestryAccordion,
    TydeIcon,
    TydeProgressBar,
    SubAccordion,
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
  },
  data() {
    return {
      activeIndex: 0,
      showCompletion: false,
      isMounted: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isFavourite"]),
    ...mapState(["selectedModuleId"]),
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
    hasNext() {
      return this.activeIndex < this.rows.length - 1
    },
    rows() {
      return this.node.childOrdering.map(id => {
        const node = this.getNode(id)
        const children = node.isSubAccordion
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
    scrollToTop() {
      const el = this.$refs.container
      if (el) {
        el.scrollTop = 0
      }
    },
    toggle(index) {
      if (this.activeIndex === index) {
        this.activeIndex = -1
      } else {
        this.activeIndex = index
      }
    },
    next() {
      if (this.hasNext) {
        this.activeIndex++
      } else {
        this.showCompletion = true
      }
    },
    disableRow(index) {
      if (this.node.userType === "teen") {
        return false
      }
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
    },
    async updateProgress(rowId) {
      if (Helpers.canUserUpdateProgress(this.node) && !this.readOnly) {
        const { accordionProgress } = this.node
        if (!accordionProgress.includes(rowId)) {
          accordionProgress.push(rowId)
          await this.completeNode(rowId)

          this.updateNodeProgress({
            id: this.node.id,
            progress: accordionProgress.length / this.rows.length,
          })
          this.updateNode({
            id: this.node.id,
            newNode: { accordionProgress },
          })

          if (accordionProgress.length === this.rows.length) {
            this.$emit("complete")
          }
        }
      }
    },
    showActivityIcon(mediaType) {
      return mediaType === "gravity-form" || mediaType === "activity"
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  color: white;
  text-align: left;
  padding: 24px 48px;
  background-size: cover;
  border-radius: 8px 8px 0px 0px;
  display: flex;
  justify-content: space-between;

  img {
    height: 96px;
    margin: -24px 0;
  }
}

.title {
  font-weight: 700;
  margin: 0;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.media-container {
  height: 100%;
  overflow: scroll;
  scrollbar-color: auto black;
  scrollbar-width: none;
  padding: 0;

  ::-webkit-scrollbar-track {
    background-color: black;
  }
}

.rows {
  padding: 32px;
}

.button-completion {
  display: block;
  width: 100%;
  background: #3fa9f5;
  padding: 16px 24px;
  margin: 0;
  color: white;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.5em;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    opacity: 0.9;
  }

  p {
    padding: 0;
    font-weight: 700;
  }
}

.modal-progress {
  top: 10px;
}

.button-container {
  width: 250px;
}

.button-row {
  display: flex;

  &-trigger {
    display: flex;
    align-items: center;
    background: none;
    margin: 0;
    padding: 0;
    width: 100%;
    text-align: left;
  }

  a {
    cursor: pointer;
  }

  &-icon {
    background: #b29ac9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-right: 24px;
  }

  p {
    display: block;
    margin: 0;
    padding: 0;
    line-height: 1.1;
    font-size: 1.2em;
  }

  &-title {
    font-weight: bold;
  }

  &-description {
    font-weight: 400;
  }
}

.icon {
  width: 48px;
  height: 48px;

  &-activity {
    width: 52px;
    margin-right: 10px;
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

.icon-container {
  display: flex;
  margin-right: 10px;
  align-items: center;
  flex: auto;
}

.button-finished {
  background: #bbd8ee;
  border-radius: 16px;
  margin: 0;
  padding: 8px 36px;
  color: #026c93;
  font-weight: bold;
  font-size: 1.2em;
}

.button-scroll-top {
  cursor: pointer;
  position: absolute;
  right: 24px;
  bottom: 24px;
  background: white;
  border: 2px solid #3fa9f5;
  color: #3fa9f5;
  border-radius: 50%;
  padding: 0;
  width: 56px;
  height: 56px;
  z-index: 10;
}

.sub-accordion-text {
  margin-bottom: 0;
}

.accordion-row {
  background: #643493;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .content {
    position: relative;
    background: white;
    border-radius: 16px;
    margin-top: 24px;
    margin-bottom: 16px;
    box-shadow: 4px 8px 8px rgba(0, 0, 0, 0.16);
  }
}
</style>
