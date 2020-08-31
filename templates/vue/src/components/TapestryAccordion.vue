<script>
export default {
  name: "tapestry-accordion",
  props: {
    rows: {
      type: Array,
      required: true,
    },
    value: {
      type: null,
      required: true,
    },
  },
  computed: {
    hasNext() {
      return this.rows.indexOf(this.value) < this.rows.length - 1
    },
  },
  methods: {
    isVisible(row) {
      return this.value === row
    },
    toggle(row) {
      this.$emit("input", this.isVisible(row) ? null : row)
    },
    next() {
      if (this.hasNext) {
        const currIndex = this.rows.indexOf(this.value)
        this.toggle(this.rows[currIndex + 1])
      }
    },
  },
  render() {
    return this.$scopedSlots.default({
      isVisible: this.isVisible,
      hasNext: this.hasNext,
      next: this.next,
      toggle: this.toggle,
    })
  },
}
</script>
