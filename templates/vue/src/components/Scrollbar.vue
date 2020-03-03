<template>
  <div
    v-if="scrollHeight > clientHeight"
    class="scrollbar"
    :style="styles"
    @mousedown="handleDragStart"
  ></div>
</template>

<script>
export default {
  name: "scrollbar",
  props: {
    scrollTop: {
      type: Number,
      required: true,
    },
    scrollHeight: {
      type: Number,
      required: true,
    },
    clientHeight: {
      type: Number,
      required: true,
    },
  },
  computed: {
    styles() {
      const offset =
        (this.scrollTop / (this.scrollHeight - this.clientHeight)) *
        (this.clientHeight - 48)
      return {
        transform: `translateY(${offset}px)`,
      }
    },
  },
  methods: {
    handleDragStart() {
      document.body.style.userSelect = "none"
      const box = this.$el.getBoundingClientRect()
      const handleDrag = evt => {
        const offset = (evt.clientY - box.top) / this.clientHeight
        this.$emit("scrollchange", offset)
      }
      document.addEventListener("mousemove", handleDrag)
      document.addEventListener(
        "mouseup",
        () => {
          document.removeEventListener("mousemove", handleDrag)
          document.body.style.userSelect = ""
        },
        { once: true }
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 48px;
  background: gray;
  border-radius: 6px;
}
</style>
