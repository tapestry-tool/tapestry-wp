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
    nodeId: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      activeRow: null,
    }
  },
  computed: {
    hasNext() {
      return this.rows.indexOf(this.activeRow) < this.rows.length - 1
    },
  },
  watch: {
    activeRow() {
      if (this.nodeId !== 0) {
        const index =
          this.rows.indexOf(this.activeRow) === -1
            ? ""
            : "/" + this.rows.indexOf(this.activeRow)
        this.$router.push("/nodes/view/" + this.nodeId + index)
      }
    },
  },
  created() {
    if (this.defaultIndex >= 0) {
      const row = this.rows[this.defaultIndex]
      if (row) {
        this.activeRow = row
      }
    }
  },
  methods: {
    isVisible(row) {
      return this.activeRow === row
    },
    toggle(row) {
      if (this.isVisible(row)) {
        this.activeRow = null
      } else {
        this.activeRow = row
      }
    },
    next() {
      if (this.hasNext) {
        const currIndex = this.rows.indexOf(this.activeRow)
        this.activeRow = this.rows[currIndex + 1]
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
