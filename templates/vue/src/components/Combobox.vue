<template>
  <b-form-group>
    <b-form-input
      ref="input"
      v-model="inputValue"
      @focus="isMenuOpen = true"
      @blur="isMenuOpen = false"
    ></b-form-input>
    <div v-if="isMenuOpen">
      <button
        v-for="option in visibleOptions"
        :key="option"
        @mousedown.prevent="handleClick(option)"
      >
        <slot :option="option">{{ option.toString() }}</slot>
      </button>
    </div>
  </b-form-group>
</template>

<script>
export default {
  name: "combobox",
  props: {
    itemText: {
      type: String,
      required: false,
      default: null,
    },
    options: {
      type: Array,
      required: true,
    },
    value: {
      type: [Object, String],
      required: true,
    },
  },
  data() {
    return {
      isMenuOpen: false,
      inputValue: "",
    }
  },
  computed: {
    text() {
      return typeof this.value === "string"
        ? this.value
        : this.itemText
        ? this.value[this.itemText]
        : ""
    },
    visibleOptions() {
      if (this.inputValue === this.text) {
        return this.options
      }

      const options = this.options.filter(option => {
        return option.id == this.inputValue || option.title.includes(this.inputValue)
      })
      return options.length ? options : this.options
    },
  },
  created() {
    this.inputValue = this.text
  },
  methods: {
    handleClick(option) {
      this.$emit("input", option)
      this.inputValue = option[this.itemText]
      this.$refs.input.blur()
    },
  },
}
</script>
