<template>
  <div>
    <b-img
      v-if="useImages && item.imageurl != null"
      :src="item.imageurl"
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
  data() {
    return {
      checked: true,
    }
  },
}
</script>

<style lang="scss">
.image-choice {
  width: 60px;
}
</style>
