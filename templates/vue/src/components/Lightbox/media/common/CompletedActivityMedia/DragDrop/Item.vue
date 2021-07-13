<template>
  <div class="container">
    <div
      class="circle"
      :style="{
        'background-image': item.imageUrl ? 'url(' + item.imageurl + ')' : 'none',
        'background-color': item.color,
      }"
    ></div>
    <b v-if="!hideText">{{ item.text }}</b>
  </div>
</template>
<script>
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
