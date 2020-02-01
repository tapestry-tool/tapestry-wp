<template>
  <div ref="container" class="media-container">
    <header class="header" :style="headerBackground">
      <h1 class="title">{{ node.title }}</h1>
      <img :src="node.imageURL" />
    </header>
    <accordion-row
      v-for="(row, index) in rows"
      :key="row.id"
      :visible="index === activeIndex"
    >
      <template v-slot:trigger>
        <button
          class="button-row"
          :disabled="lockRows && disabledFrom >= 0 && index > disabledFrom"
          @click="toggle(index)"
        >
          <div class="button-row-icon">
            <i :class="index === activeIndex ? 'fas fa-minus' : 'fas fa-plus'"></i>
          </div>
          <div>
            <p class="button-row-title">{{ row.title }}</p>
            <p class="button-row-description">{{ row.description }}</p>
          </div>
          <div class="icon-container">
            <tyde-icon
              v-if="row.mediaType === 'gravity-form'"
              class="icon icon-activity"
              icon="activity"
            ></tyde-icon>
            <tyde-icon
              v-if="row.completed"
              class="icon"
              icon="checkmark"
            ></tyde-icon>
            <tyde-icon
              v-if="lockRows && disabledFrom >= 0 && index > disabledFrom"
              class="icon"
              icon="lock"
            ></tyde-icon>
          </div>
        </button>
      </template>
      <template v-slot:content>
        <div :style="rowContainerStyles(row)">
          <tapestry-media
            :allow-end-screen="false"
            :node-id="row.id"
            :dimensions="dimensions"
            :container-styles="mediaContainerStyles(row)"
            @complete="updateProgress(row.id)"
            @close="toggle(index)"
          />
        </div>
      </template>
      <template v-slot:footer>
        <button
          v-if="row.completed"
          class="button-finished"
          @click="showCompletion = true"
        >
          Finished?
        </button>
      </template>
    </accordion-row>
    <tapestry-modal
      v-if="showCompletion"
      :allow-close="false"
      :content-container-style="confirmationStyles"
      @close="showCompletion = false"
    >
      <div class="button-container">
        <button class="button-completion" @click="next">
          {{ node.typeData.continueButtonText }}
        </button>
        <button
          class="button-completion button-completion-cancel"
          @click="showCompletion = false"
        >
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
import { mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import TapestryModal from "../TapestryModal"
import AccordionRow from "../AccordionRow"
import TydeIcon from "../tyde/TydeIcon"
import Helpers from "../../utils/Helpers"
import AccordionHeader from "../../assets/accordion-header.png"
import AccordionConfirmation from "../../assets/accordion-confirmation.png"
import WatchVideoBackground from "../../assets/blort-watch-video.png"

export default {
  name: "accordion-media",
  components: {
    TapestryMedia,
    TapestryModal,
    AccordionRow,
    TydeIcon,
  },
  props: {
    node: {
      type: Object,
      required: true,
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
    ...mapGetters(["getDirectChildren", "getNode"]),
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
      return this.getDirectChildren(this.node.id).map(this.getNode)
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
      const activeRow = this.rows[this.activeIndex >= 0 && this.activeIndex]
      if (activeRow.mediaType !== "video") {
        return { width: rect.width, height: rect.height }
      }
      return { width: this.node.fullscreen ? 600 : 400, height: 400 }
    },
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(node => !node.completed)
    },
  },
  mounted() {
    this.isMounted = true
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "updateNodeProgress"]),
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
      this.showCompletion = false
      if (this.hasNext) {
        this.activeIndex++
      } else {
        this.$emit("close")
      }
    },
    rowContainerStyles(row) {
      return row.mediaType === "video"
        ? {
            backgroundImage: `url(${Helpers.getImagePath(WatchVideoBackground)})`,
            backgroundOrigin: "content-box",
            backgroundPosition: "right",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            padding: "32px",
          }
        : {}
    },
    mediaContainerStyles(row) {
      return row.mediaType === "video"
        ? { width: this.dimensions.width + "px", borderRadius: 0 }
        : {}
    },
    updateProgress(rowId) {
      const { accordionProgress } = this.node
      if (!accordionProgress.includes(rowId)) {
        accordionProgress.push(rowId)
        this.updateNodeProgress({
          id: this.node.id,
          progress: accordionProgress.length / this.rows.length,
        })
        this.updateNode({
          id: this.node.id,
          newNode: { accordionProgress },
        })

        if (accordionProgress.length === this.rows.length) {
          this.completeNode(this.node.id)
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
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
  padding: 0 48px 32px 48px;

  ::-webkit-scrollbar-track {
    background-color: black;
  }
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

  &-cancel {
    background: #9fd4fa;
  }

  p {
    padding: 0;
    font-weight: 700;
  }
}

.button-container {
  width: 250px;
}

.button-row {
  display: flex;
  align-items: center;
  background: none;
  margin: 0;
  padding: 0;
  width: 100%;
  text-align: left;

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
  }
}

.icon-container {
  margin-left: auto;
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
</style>
