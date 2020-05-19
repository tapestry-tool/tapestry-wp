<template>
  <div ref="container">
    <h4>Your Favourite Topics</h4>
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
            </div>
            <div v-if="index === activeIndex" class="content">
              <tapestry-media
                v-if="node.mediaType !== 'accordion'"
                :node-id="node.id"
                :allow-end-screen="false"
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
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TapestryAccordion from "@/components/TapestryAccordion"
import TapestryMedia from "@/components/TapestryMedia"
import AccordionMedia from "@/components/lightbox/AccordionMedia"

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
      const { width, height } = this.$refs.container.getBoundingClientRect()
      return {
        width,
        height,
      }
    },
  },
  mounted() {
    this.isMounted = true
  },
}
</script>

<style lang="scss" scoped>
h4 {
  margin-bottom: 16px;
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
