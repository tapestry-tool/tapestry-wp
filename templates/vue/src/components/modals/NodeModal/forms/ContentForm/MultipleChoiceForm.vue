<template>
<div>
  <b-form-group v-if="multipleChoiceSelected && multipleAnswerSelected" label="Checkbox Form">
    <p> this is Checkbox form here</p>
  </b-form-group>
  <b-form-group v-else-if="multipleChoiceSelected && !multipleAnswerSelected" label="RadioButton Form"  >
    <b-form-radio name="some-radios" value = "1"><b-form-input v-model="text" placeholder="Option 1" ></b-form-input></b-form-radio>
    <b-form-radio name="some-radios" value = "2"><b-form-input v-model="text" placeholder="Option 2"></b-form-input></b-form-radio>
    <b-form-radio name="some-radios" value = "3"><b-form-input v-model="text" placeholder="Option 3"></b-form-input></b-form-radio>
  </b-form-group>
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
  },
  data() {
    return {
      selected: ''
    }
  },
}
</script>