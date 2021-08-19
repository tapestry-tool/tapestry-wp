<template>
  <div>
    <b-img
      v-if="useImages && item.imageUrl != null"
      :src="item.imageUrl"
      class="image-choice"
    ></b-img>
    {{ item.value }}
  </div>
</template>

<script>
export default {
  name: "completed-multiple-choice-item",
  props: {
    item: {
      type: Object,
      required: true,
    },
    useImages: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
div {
  text-align: left;
}

.image-choice {
  width: 60px;
}
</style>
