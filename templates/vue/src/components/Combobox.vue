<template>
  <b-form-group>
    <b-form-input
      ref="input"
      v-model="inputValue"
      @focus="isMenuOpen = true"
      @blur="isMenuOpen = false"
    ></b-form-input>
    <div v-if="isMenuOpen" class="menu">
      <button
        v-for="option in visibleOptions"
        :key="option"
        class="menu-button"
        @mousedown.prevent="handleClick(option)"
      >
        <slot :option="option">{{ option.toString() }}</slot>
      </button>
    </div>
  </b-form-group>
</template>

<script>
const MAX_OPTIONS_LENGTH = 15

export default {
  name: "combobox",
  props: {
    itemText: {
      type: String,
      required: false,
      default: null,
    },
    itemValue: {
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
      isMenuOpen: true,
      inputValue: "",
    }
  },
  computed: {
    text() {
      if (typeof this.options[0] === "string") {
        return this.value
      }
      const item = this.options.find(option => option[this.itemValue] == this.value)
      return item ? item[this.itemText] : ""
    },
    visibleOptions() {
      if (this.inputValue === this.text) {
        return this.options
      }

      const options = this.options.filter(option => {
        return (
          option[this.itemValue] === this.inputValue ||
          option[this.itemText].toLowerCase().includes(this.inputValue.toLowerCase())
        )
      })
      return options.length
        ? options.length > MAX_OPTIONS_LENGTH
          ? options.slice(0, MAX_OPTIONS_LENGTH)
          : options
        : this.options
    },
  },
  watch: {
    text(newText) {
      if (this.inputValue.length === 0) {
        this.inputValue = newText
      }
    },
  },
  methods: {
    handleClick(option) {
      this.$emit("input", this.getValue(option))
      this.inputValue = option[this.itemText]
      this.$refs.input.blur()
    },
    getValue(option) {
      return typeof option === "string" ? option : option[this.itemValue]
    },
  },
}
</script>

<style lang="scss" scoped>
.menu {
  border: 1px solid #ccc;
  border-radius: 0 0 4px 4px;
}

.menu-button {
  display: block;
  padding: 4px 8px;
  margin: 0;
  background: none;
  color: #495057;
  width: 100%;

  &:hover {
    background: #cce5ff;
  }
}
</style>
