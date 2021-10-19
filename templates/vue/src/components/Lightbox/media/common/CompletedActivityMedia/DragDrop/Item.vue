<template>
  <div
    class="container mt-1 mb-1"
    :style="{
      'background-image': item.imageUrl ? 'url(' + item.imageUrl + ')' : 'none',
      'background-color': item.color,
      'border-color': borderColor,
    }"
  >
    <b v-if="!hideText">{{ item.text }}</b>
  </div>
</template>
<script>
import TinyColor from "tinycolor2"

export default {
  name: "item",
  props: {
    item: {
      type: Object,
      required: true,
    },
    hideText: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    borderColor() {
      return TinyColor(this.item.color)
        .darken()
        .toString()
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  color: #000;
  border-radius: 15px;
  width: 75%;
  min-width: 100px;
  border: solid 1px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
  padding: 10px 0;
  margin: auto;
}
</style>
