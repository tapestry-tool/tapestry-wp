<template>
  <div class="container" draggable="true" @dragstart="dragStart($event, item)">
    <div
      class="circle"
      :style="{
        'background-image': hasImage ? 'url(' + itemData.imageurl + ')' : 'none',
        'background-color': itemData.color,
      }"
    ></div>
    <b v-if="!question.answerTypes.dragDrop.hideText">{{ itemData.text }}</b>
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
    question: {
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
      return this.question.answerTypes.dragDrop.useImages
    },
    itemData() {
      return this.question.answerTypes.dragDrop.items.find(item => {
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
  min-height: 140px;
  border: solid;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
  margin: auto;
}
.container {
  margin-top: 30px;
  margin-bottom: 30px;
  cursor: pointer;
}
</style>
