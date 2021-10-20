<template>
  <div
    class="container my-1"
    draggable="true"
    :style="{
      'background-image': hasImage ? 'url(' + itemData.imageUrl + ')' : 'none',
      'background-color': itemData.color,
      'border-color': borderColor,
    }"
    @dragstart="dragStart($event, item)"
  >
    <b v-if="!dragDrop.hideText">{{ itemData.text }}</b>
  </div>
</template>

<script>
import TinyColor from "tinycolor2"

export default {
  name: "item",
  props: {
    node: {
      type: Object,
      required: true,
    },
    dragDrop: {
      type: Object,
      required: true,
    },
    item: {
      type: String,
      required: true,
    },
  },
  computed: {
    hasImage() {
      return this.dragDrop.useImages
    },
    itemData() {
      return this.dragDrop.items.find(item => {
        return item.id === this.item
      })
    },
    borderColor() {
      return TinyColor(this.itemData.color)
        .darken()
        .toString()
    },
  },
  methods: {
    dragStart(e, itemId) {
      e.dataTransfer.dropEffect = "move"
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("itemId", itemId)
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  cursor: move;
  border-radius: 15px;
  transform: translate(0, 0);
  width: 75%;
  border: solid 1px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
  padding: 10px 0;
  margin: auto;
}
</style>
