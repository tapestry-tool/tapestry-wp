<template>
  <div>
    <b-img
      v-if="useImages && item.imageurl != null"
      :src="item.imageurl"
      class="imageChoice"
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
.imageChoice {
  width: 60px;
}
</style>
