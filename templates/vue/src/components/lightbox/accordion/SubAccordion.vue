<template>
  <div ref="container">
    <accordion-row
      v-for="(row, index) in rows"
      :key="row.id"
      ref="rowRefs"
      class="sub-accordion-row"
      :visible="index === activeIndex"
    >
      <template v-slot:trigger>
        <div class="button-row">
          <button class="button-row-trigger" @click="toggle(index)">
            <i :class="index === activeIndex ? 'fas fa-minus' : 'fas fa-plus'"></i>
            {{ row.title }}
          </button>
          <a @click="updateFavourites(row.id)">
            <i
              v-if="isFavourite(row.id)"
              class="fas fa-heart fa-sm"
              style="color:red;"
            ></i>
            <i v-else class="fas fa-heart fa-sm" style="color:white;"></i>
          </a>
        </div>
      </template>
      <template v-slot:content>
        <tapestry-media
          :node-id="row.id"
          :dimensions="dimensions"
          :autoplay="false"
          style="color: white;"
          @close="toggle(index)"
          @load="handleLoad(index)"
        />
      </template>
    </accordion-row>
  </div>
</template>

<script>
import AccordionRow from "@/components/AccordionRow"
import TapestryMedia from "@/components/TapestryMedia"
import { mapGetters, mapActions } from "vuex"

export default {
  name: "sub-accordion",
  components: {
    AccordionRow,
    TapestryMedia,
  },
  props: {
    rows: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      activeIndex: -1,
      isMounted: false,
    }
  },
  computed: {
    ...mapGetters(["getFavourites"]),
    hasNext() {
      return this.activeIndex < this.rows.length - 1
    },
    dimensions() {
      if (!this.isMounted) {
        return {
          height: 0,
          width: 0,
        }
      }
      const box = this.$refs.container
      const rect = box.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    },
    favourites() {
      return this.getFavourites ? this.getFavourites : []
    },
  },
  mounted() {
    this.isMounted = true
  },
  methods: {
    ...mapActions(["updateUserFavourites"]),
    handleLoad(idx) {
      this.$emit("load", this.$refs.rowRefs[idx].$el)
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

.sub-accordion-row {
  background: rgba(0, 0, 0, 0.2);
}
</style>
