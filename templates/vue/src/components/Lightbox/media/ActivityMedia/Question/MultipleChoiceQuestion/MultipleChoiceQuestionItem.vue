<template>
  <div class="container">
    <component
      :is="isCheckBox ? 'b-form-checkbox' : 'b-form-radio'"
      :value="item.id"
      :data-qa="`multiple-choice-question-item-${index}-checked`"
    >
      <b-img
        v-if="hasImage && item.imageUrl !== null"
        :src="item.imageUrl"
        class="choice-image"
        :data-qa="`multiple-choice-question-item-${index}-thumbnail`"
      ></b-img>
      {{ item.value }}
    </component>
  </div>
</template>

<script>
export default {
  name: "user-choice-row",
  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isCheckBox: {
      type: Boolean,
      required: true,
    },
    hasImage: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="scss">
.container {
  float: left;
  clear: both;
}

.choice-image {
  width: 200px;
}
</style>
