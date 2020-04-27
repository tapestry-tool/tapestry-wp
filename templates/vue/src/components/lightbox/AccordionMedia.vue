<template>
  <div ref="container" class="media-container">
    <header class="header" :style="headerBackground">
      <h1 class="title">{{ node.title }}</h1>
      <img :src="node.imageURL" />
    </header>
    <div class="rows">
      <accordion-row
        v-for="(row, index) in rows"
        :key="row.node.id"
        ref="rowRefs"
        :visible="index === activeIndex"
      >
        <template v-slot:trigger>
          <div class="button-row">
            <button
              class="button-row-trigger"
              :disabled="disableRow(index)"
              @click="toggle(index)"
            >
              <div class="button-row-icon">
                <i
                  :class="index === activeIndex ? 'fas fa-minus' : 'fas fa-plus'"
                ></i>
              </div>
              <div>
                <p class="button-row-title">{{ row.node.title }}</p>
                <p class="button-row-description">{{ row.node.description }}</p>
              </div>
            </button>
            <div class="icon-container">
              <tyde-icon
                v-if="row.node.mediaType === 'gravity-form'"
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
              <a v-if="!disableRow(index)" @click="updateFavourites(row.node.id)">
                <i
                  v-if="isFavourite(row.node.id)"
                  class="fas fa-heart fa-lg"
                  style="color:red;"
                ></i>
                <i v-else class="fas fa-heart fa-lg" style="color:white;"></i>
              </a>
            </div>
          </div>
        </template>
        <template v-slot:content>
          <tapestry-media
            :node-id="row.node.id"
            :dimensions="dimensions"
            :autoplay="false"
            style="margin-bottom: 24px;"
            @complete="updateProgress(row.node.id)"
            @close="toggle(index)"
            @load="handleLoad($refs.rowRefs[index].$el)"
          />
          <p v-if="row.children.length > 0" class="sub-accordion-text">
            {{ row.node.typeData.subAccordionText }}
          </p>
          <sub-accordion
            v-if="row.children.length > 0"
            :rows="row.children"
            @load="handleLoad"
          ></sub-accordion>
        </template>
        <template v-slot:footer>
          <button v-if="row.node.completed" class="mt-2" @click="next">
            {{ node.typeData.finishButtonText }}
          </button>
        </template>
      </accordion-row>
    </div>
    <tapestry-modal
      v-if="showCompletion"
      :node-id="node.id"
      :allow-close="false"
      :content-container-style="confirmationStyles"
      @close="showCompletion = false"
    >
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
import { mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import TapestryModal from "../TapestryModal"
import AccordionRow from "../AccordionRow"
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
    AccordionRow,
    TydeIcon,
    SubAccordion,
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
    ...mapGetters(["getDirectChildren", "getNode", "getFavourites"]),
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
    favourites() {
      return this.getFavourites ? this.getFavourites : []
    },
  },
  mounted() {
    this.isMounted = true
  },
  methods: {
    ...mapMutations(["updateNode"]),
    ...mapActions(["completeNode", "updateNodeProgress", "updateUserFavourites"]),
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
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
    },
    async updateProgress(rowId) {
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
    },
    isFavourite(nodeId) {
      nodeId = nodeId.toString()
      return this.favourites.find(id => id == nodeId)
    },
    updateFavourites(nodeId) {
      let updatedFavouritesList = [...this.favourites]
      nodeId = nodeId.toString()
      if (this.isFavourite(nodeId)) {
        updatedFavouritesList = updatedFavouritesList.filter(id => id != nodeId)
      } else {
        updatedFavouritesList.push(nodeId)
      }
      this.updateUserFavourites(updatedFavouritesList)
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

.button-container {
  width: 250px;
}

.button-row {
  display: flex;
  
  &-trigger{
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
  }
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
</style>
