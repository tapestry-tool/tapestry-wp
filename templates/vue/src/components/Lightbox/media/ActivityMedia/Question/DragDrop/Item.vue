<template>
  <div class="container my-1" draggable="true" @dragstart="dragStart($event, item)">
    <div
      class="circle"
      :style="{
        'background-image': hasImage ? 'url(' + itemData.imageUrl + ')' : 'none',
        'background-color': itemData.color,
      }"
    ></div>
    <b v-if="!dragDrop.hideText">{{ itemData.text }}</b>
  </div>
</template>

<script>
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

<style scoped>
.circle {
  border-radius: 100%;
  height: 100px;
  width: 100px;
  border: solid;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
  margin: auto;
}
.container {
  cursor: pointer;
}
</style>
