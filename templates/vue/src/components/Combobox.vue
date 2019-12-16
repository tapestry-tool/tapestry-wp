<template>
  <b-form-group>
    <b-form-input
      ref="input"
      v-model="inputValue"
      @blur="handleBlur"
      @focus="handleFocus"
    ></b-form-input>
    <div v-if="isOpen" class="combobox">
      <button
        v-for="option in visibleOptions"
        :key="option[itemValue]"
        @mousedown.prevent="handleClick(option)"
      >
        <div class="combobox-item">
          <slot :option="option">{{ option.toString() }}</slot>
        </div>
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
      isOpen: false,
      inputValue: "",
      selected: false,
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
    handleBlur() {
      this.isOpen = false
      // if user leaves focus and hasn't selected anything,
      // revert to whatever the previous selection was.
      if (this.inputValue !== this.text && !this.selected) {
        this.inputValue = this.text
      }
    },
    handleClick(option) {
      this.$emit("input", this.getValue(option))
      this.inputValue = option[this.itemText]
      this.selected = true
      this.$refs.input.blur()
    },
    handleFocus() {
      this.isOpen = true
      this.selected = false
      this.$emit("focus")
    },
    getValue(option) {
      return typeof option === "string" ? option : option[this.itemValue]
    },
  },
}
</script>

<style lang="scss" scoped>
.combobox {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 0 0 4px 4px;

  > button {
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
}
</style>

<style lang="scss">
.combobox-item {
  display: flex;
  align-items: center;
  text-transform: capitalize;

  code,
  p {
    margin: 0;
    padding: 0;
  }

  p {
    font-weight: normal;
  }

  code {
    color: #495057;
    margin-right: 1em;
  }
}
</style>
