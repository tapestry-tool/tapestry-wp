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
        <button class="button-row" @click="toggle(index)">
          <i :class="index === activeIndex ? 'fas fa-minus' : 'fas fa-plus'"></i>
          {{ row.title }}
        </button>
      </template>
      <template v-slot:content>
        <tapestry-media
          :node-id="row.id"
          :dimensions="dimensions"
          :autoplay="false"
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

export default {
  name: "sub-accordion",
  components: {
    AccordionRow,
    TapestryMedia,
  },
  props: {
    dimensions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
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
    hasNext() {
      return this.activeIndex < this.rows.length - 1
    },
  },
  mounted() {
    this.isMounted = true
  },
  methods: {
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
  },
}
</script>

<style lang="scss" scoped>
.button-row {
  display: flex;
  align-items: center;
  background: none;
  margin: 0;
  width: 100%;
  border-radius: 4px;
  text-align: left;

  i {
    margin-right: 8px;
  }
}

.sub-accordion-row {
  background: rgba(0, 0, 0, 0.2);
}
</style>
