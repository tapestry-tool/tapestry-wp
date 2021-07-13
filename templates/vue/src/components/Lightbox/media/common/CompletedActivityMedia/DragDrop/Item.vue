<template>
  <div class="mt-1 mb-1">
    <div
      class="circle"
      :style="{
        'background-image': item.imageUrl ? 'url(' + item.imageUrl + ')' : 'none',
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
  width: 40px;
  height: 40px;
  border: solid;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
  margin: auto;
}
</style>
