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
      isMenuOpen: false,
      inputValue: "",
    }
  },
  computed: {
    text() {
      if (typeof this.options[0] === "string") {
        return this.value
      }

      const item = this.options.find(option => option[this.itemValue] === this.value)
      return item ? item[this.itemText] : ""
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
  border-radius: 4px;
  margin-top: 1em;
}

.menu-button {
  display: block;
  padding: 12px;
  margin: 0;
  background: none;
  color: inherit;
  width: 100%;

  &:hover {
    background: #cce5ff;
  }
}
</style>
