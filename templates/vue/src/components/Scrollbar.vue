<template>
  <div v-if="scrollHeight > clientHeight" class="scrollbar" :style="styles"></div>
</template>

<script>
export default {
  name: "scrollbar",
  props: {
    scrollHeight: {
      type: Number,
      required: true,
    },
    clientHeight: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      scrollTop: 0,
    }
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
  mounted() {
    this.$parent.$el.addEventListener("scroll", this.handleScroll)
  },
  beforeDestroy() {
    this.$parent.$el.removeEventListener("scroll", this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.scrollTop = this.$parent.$el.scrollTop
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
