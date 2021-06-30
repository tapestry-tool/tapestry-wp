<template>
  <div class="container">
    <div
      class="circle"
      :style="{
        'background-image': 'url(' + bucketItem.imageurl + ')',
        'background-color': bucketItem.color,
      }"
    ></div>
    <b v-if="!question.answerTypes.dragDrop.hideText">{{ bucketItem.text }}</b>
  </div>
</template>
<script>
export default {
  props: {
    bucketItem: {
      type: Object,
      required: true,
    },
    question: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
}
</script>

<style scoped>
.circle {
  border-radius: 100%;
  min-height: 50px;
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
