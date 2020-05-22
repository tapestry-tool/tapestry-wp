<template>
  <div ref="container">
    <tapestry-accordion :rows="favouriteNodes" :default-index="-1">
      <template v-slot="{ activeIndex, toggle }">
        <div>
          <div
            v-for="(node, index) in favouriteNodes"
            :key="node.id"
            class="favourite"
          >
            <div class="button-row">
              <button class="button-row-trigger" @click="toggle(index)">
                <div class="button-row-icon">
                  <i
                    :class="index === activeIndex ? 'fas fa-minus' : 'fas fa-plus'"
                  ></i>
                </div>
                <div>
                  <p class="button-row-title">{{ node.title }}</p>
                  <p class="button-row-description">{{ node.description }}</p>
                </div>
              </button>
              <a style="margin-right: 16px;" @click="handleUnfavourite(node.id)">
                <i class="fas fa-heart fa-lg" style="color:red;"></i>
              </a>
            </div>
            <div v-if="index === activeIndex" class="content">
              <tapestry-media
                v-if="node.mediaType !== 'accordion'"
                :node-id="node.id"
                :autoplay="false"
                :dimensions="dimensions"
                read-only
              />
              <accordion-media
                v-else
                read-only
                :node="node"
                :style="{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                }"
              ></accordion-media>
            </div>
          </div>
        </div>
      </template>
    </tapestry-accordion>
    <div v-if="showUnfavouriteDialog" class="unfavourite-dialog">
      Are you sure you want to remove {{ focusedNode.title }} from your favourites?
      <div>
        <b-button @click="handleCancel">
          Cancel
        </b-button>
        <b-button @click="handleConfirm">
          Yes
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import AccordionMedia from "@/components/lightbox/AccordionMedia"
import TapestryAccordion from "@/components/TapestryAccordion"
import TapestryMedia from "@/components/TapestryMedia"
import Helpers from "../../utils/Helpers"

export default {
  name: "tyde-favourites",
  components: {
    AccordionMedia,
    TapestryAccordion,
    TapestryMedia,
  },
  props: {
    favourites: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isMounted: false,
      showUnfavouriteDialog: false,
      focusedNode: null,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    favouriteNodes() {
      return this.favourites.map(this.getNode)
    },
    dimensions() {
      if (!this.isMounted) {
        return {}
      }
      const { width } = this.$refs.container.getBoundingClientRect()
      return {
        width,
        height: Helpers.getBrowserHeight(),
      }
    },
  },
  mounted() {
    this.isMounted = true
  },
  methods: {
    ...mapActions(["toggleFavourite"]),
    handleCancel() {
      this.showUnfavouriteDialog = false
      this.focusedNode = null
    },
    async handleConfirm() {
      await this.toggleFavourite(this.focusedNode.id)
      this.showUnfavouriteDialog = false
    },
    handleUnfavourite(id) {
      this.focusedNode = this.getNode(id)
      this.showUnfavouriteDialog = true
    },
  },
}
</script>

<style lang="scss" scoped>
.unfavourite-dialog {
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tapestry-light-gray);
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  > div {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  .btn {
    background: var(--tapestry-med-gray);
    border: none;
    margin-right: 8px;
    width: 75px;

    &:last-child {
      background: var(--tapestry-light-blue);
      margin-right: 0;
    }
  }
}

.favourite {
  background-color: var(--tapestry-med-gray);
  border-radius: 16px;
  margin-bottom: 16px;
  padding: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.button-row {
  display: flex;
  align-items: center;

  &-trigger {
    display: flex;
    align-items: center;
    background: none;
    margin: 0;
    padding: 0;
    width: 100%;
    text-align: left;
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

.content {
  margin-top: 24px;
}
</style>
