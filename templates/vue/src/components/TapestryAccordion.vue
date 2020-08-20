<script>
export default {
  name: "tapestry-accordion",
  props: {
    rows: {
      type: Array,
      required: true,
    },
    nodeId: {
      type: Number,
      required: false,
      default: 0,
    },
    baseUrl: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    hasNext() {
      return this.rows.indexOf(this.activeRow) < this.rows.length - 1
    },
    activeRowIndex() {
      const rowParam =
        this.nodeId === 0 ? this.$route.params.subrow : this.$route.params.row
      return rowParam == undefined ? -1 : Number(rowParam)
    },
    activeRow() {
      return this.activeRowIndex == -1 ? null : this.rows[this.activeRowIndex]
    },
  },
  methods: {
    isVisible(row) {
      return this.activeRow === row
    },
    toggle(row) {
      let pathString = this.$route.path
      if (this.activeRow !== null && this.activeRow === row) {
        pathString = this.deactivate(row)
        return this.$router.push(pathString)
      }
      if (this.activeRow !== null) {
        pathString = this.deactivate(this.activeRow)
      }
      this.$router.push(pathString + "/" + this.rows.indexOf(row))
    },
    deactivate(row) {
      if (this.isVisible(row) && this.baseUrl !== "") {
        return this.baseUrl + this.nodeId
      } else if (this.isVisible(row) && this.baseUrl === "") {
        const indexLength = String(this.rows.indexOf(this.activeRow)).length + 1
        return this.$route.path.slice(0, -indexLength) // Removes the index and backslash from end of URL
      }
      return this.$route.path
    },
    next() {
      if (this.hasNext) {
        const currIndex = this.rows.indexOf(this.activeRow)
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
