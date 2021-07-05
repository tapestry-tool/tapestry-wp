<template>
  <div class="container">
    <!-- // same logic with the is component -->
    <b-form-checkbox
      v-if="isCheckBox"
      :value="item.id"
      :data-qa="`multiple-choice-question-item-${item.id}-checked`"
    >
      <b-img
        v-if="hasImage && item.imageUrl !== null"
        :src="item.imageUrl"
        class="imageChoice"
        :data-qa="`multiple-choice-question-item-${item.id}-thumbnail`"
      ></b-img>
      {{ item.value }}
    </b-form-checkbox>
    <b-form-radio
      v-else-if="!isCheckBox"
      :value="item.id"
      :data-qa="`multiple-choice-radio-question-item-${item.id}-checked`"
    >
      <b-img
        v-if="hasImage && item.imageUrl !== null"
        :src="item.imageUrl"
        class="imageChoice"
        :data-qa="`multiple-choice-radio-question-item-${item.id}-thumbnail`"
      ></b-img>
      {{ item.value }}
    </b-form-radio>
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
}
</script>

<style lang="scss">
.container {
  float: left;
  clear: both;
}

.imageChoice {
  width: 200px;
}
</style>
