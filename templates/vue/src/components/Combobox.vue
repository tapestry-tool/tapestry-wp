<template>
  <b-form-group>
    <b-form-input :value="value"></b-form-input>
    <div v-if="isMenuOpen">
      <button v-for="option in options" :key="option">
        <slot :option="option">
          {{ option.toString() }}
        </slot>
      </button>
    </div>
  </b-form-group>
</template>

<script>
export default {
  name: "combobox",
  props: {
    value: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isMenuOpen: true,
    }
  },
}
</script>
