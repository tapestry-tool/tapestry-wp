<script>
export default {
  name: "tapestry-accordion",
  props: {
    rows: {
      type: Array,
      required: true,
    },
    defaultIndex: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      activeIndex: this.defaultIndex,
    }
  },
  computed: {
    hasNext() {
      return this.activeIndex < this.rows.length - 1
    },
  },
  methods: {
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
  render() {
    return this.$scopedSlots.default({
      activeIndex: this.activeIndex,
      hasNext: this.hasNext,
      next: this.next,
      toggle: this.toggle,
    })
  },
}
</script>
