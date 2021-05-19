<template>
<div>
  <b-form-checkbox
    v-if="multipleChoiceSelected && multipleAnswerSelected" 
    :value="key"><b-form-input :placeholder="placeholder" ></b-form-input></b-form-checkbox>  
  <b-form-radio v-else-if="multipleChoiceSelected && !multipleAnswerSelected" 
  :value="key" name="radios"><b-form-input :placeholder="placeholder" ></b-form-input></b-form-radio> 
</div>
</template>

<script>

export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
    multipleChoiceSelected: {
      type: Boolean,
      required: true,
    },
    multipleAnswerSelected: {
      type: Boolean,
      required: true,
    },
    key: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: "",
    }
  },
}
</script>