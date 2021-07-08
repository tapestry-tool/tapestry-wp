<template>
  <div class="container">
    <component
      :is="multipleChoiceItemForm"
      :value="item.id"
      :data-qa="`multiple-choice-question-item-${item.id}-checked`"
    >
      <b-img
        v-if="hasImage && item.imageUrl !== null"
        :src="item.imageUrl"
        class="choice-image"
        :data-qa="`multiple-choice-question-item-${item.id}-thumbnail`"
      ></b-img>
      {{ item.value }}
    </component>
  </div>
</template>

<script>
export default {
  name: "user-choice-row",
  props: {
    isCheckBox: {
      type: Boolean,
      required: true,
    },
    hasImage: {
      type: Boolean,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    multipleChoiceItemForm() {
      if (this.isCheckBox) {
        return "b-form-checkbox"
      } else {
        return "b-form-radio"
      }
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
