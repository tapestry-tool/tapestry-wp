<template>
  <div>
    <b-form-input
      :id="id"
      ref="input"
      v-model="inputValue"
      :placeholder="placeholder"
      :size="size"
      :style="inputStyle"
      :autocomplete="autocomplete"
      role="combobox"
      aria-autocomplete="list"
      :aria-controls="`${id}-popup`"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-activedescendant="
        activeOption !== null ? `${id}-option-${activeOption}` : ''
      "
      @blur="closePopup"
      @keydown="handleKey"
      @click="openPopup"
    ></b-form-input>
    <div v-show="isOpen" :id="`${id}-popup`" class="combobox" role="listbox">
      <div
        v-if="!hasOptions"
        :id="`${id}-option-0`"
        class="combobox-item empty-message"
        role="option"
        aria-disabled="true"
      >
        <p>{{ emptyMessage }}</p>
      </div>
      <template v-else>
        <button
          v-for="(option, idx) in visibleOptions"
          :id="`${id}-option-${idx}`"
          :key="option[itemValue]"
          role="option"
          :aria-selected="activeOption === idx ? 'true' : null"
          :class="{
            focused: activeOption === idx,
          }"
          @mousedown.prevent="selectOption(option)"
        >
          <div class="combobox-item">
            <slot :option="option"></slot>
          </div>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
const MAX_OPTIONS_LENGTH = 15

export default {
  name: "combobox",
  props: {
    id: {
      type: String,
      required: false,
      default: "combobox",
    },
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
      type: [Object, String, Number],
      required: false,
      default: null,
    },
    placeholder: {
      type: String,
      required: false,
      default: "",
    },
    emptyMessage: {
      type: String,
      required: false,
      default: "Please add at least one option.",
    },
    size: {
      type: String,
      required: false,
      default: undefined,
    },
    inputStyle: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    disableAutocomplete: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
      inputValue: "",
      selected: false,
      activeOption: null,
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
    hasOptions() {
      return this.visibleOptions.length !== 0
    },
    visibleOptions() {
      if (this.inputValue === this.text) {
        return this.options
      }

      const options =
        this.itemValue && this.itemText
          ? this.options.filter(option => {
              return (
                option[this.itemValue] === this.inputValue ||
                option[this.itemText]
                  .toLowerCase()
                  .includes(this.inputValue.toLowerCase())
              )
            })
          : this.options.filter(text =>
              text.toLowerCase().includes(this.inputValue.toLowerCase())
            )
      return options.length
        ? options.length > MAX_OPTIONS_LENGTH
          ? options.slice(0, MAX_OPTIONS_LENGTH)
          : options
        : this.options
    },
    autocomplete() {
      return this.disableAutocomplete ? "off" : "on"
    },
  },
  watch: {
    text(newText) {
      this.inputValue = newText
    },
    activeOption(activeOption) {
      if (activeOption !== null) {
        document
          .getElementById(`${this.id}-option-${activeOption}`)
          ?.scrollIntoView({ block: "center" })
      }
    },
  },
  created() {
    this.inputValue = this.text
  },
  methods: {
    handleKey(evt) {
      const { code, altKey } = evt
      if (code === "ArrowDown") {
        if (!this.isOpen || this.activeOption === null) {
          evt.preventDefault()
          this.openPopup()
          if (!altKey) {
            this.activeOption = 0
          }
        } else if (this.hasOptions) {
          evt.preventDefault()
          if (++this.activeOption >= this.visibleOptions.length) {
            this.activeOption = 0
          }
        }
      } else if (code === "ArrowUp") {
        if (!this.isOpen || this.activeOption === null) {
          evt.preventDefault()
          this.openPopup()
          this.activeOption = this.hasOptions ? this.visibleOptions.length - 1 : 0
        } else if (this.hasOptions) {
          evt.preventDefault()
          if (--this.activeOption < 0) {
            this.activeOption = 0
          }
        }
      } else if (this.isOpen) {
        if (code === "ArrowLeft" || code == "ArrowRight") {
          this.activeOption = null
        } else if (code === "Enter") {
          if (this.hasOptions && this.activeOption !== null) {
            evt.preventDefault()
            this.selectOption(this.visibleOptions[this.activeOption])
          } else if (!this.hasOptions && this.activeOption === 0) {
            evt.preventDefault()
            this.closePopup()
          }
        } else if (code === "Escape") {
          evt.preventDefault()
          evt.stopPropagation()
          this.closePopup()
        }
      }
    },
    openPopup() {
      this.isOpen = true
      this.selected = false
    },
    closePopup() {
      this.isOpen = false
      this.activeOption = null
      this.$nextTick(() => {
        // if user leaves focus and input is empty, clear the value
        if (this.inputValue.length === 0) {
          this.$emit("input", null)
        } else if (this.inputValue !== this.text && !this.selected) {
          this.inputValue = this.text
        }
      })
    },
    selectOption(option) {
      this.$emit("input", this.getValue(option))
      this.inputValue = this.itemText ? option[this.itemText] : option
      this.selected = true
      this.closePopup()
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

    &:hover,
    &.focused {
      background: #cce5ff;
    }
  }
}
</style>

<style lang="scss">
.combobox-item {
  display: flex;
  align-items: center;
  font-weight: normal;

  code,
  p {
    margin: 0;
    padding: 0;
  }

  code {
    color: #495057;
    margin-right: 1em;
  }
}

.empty-message {
  justify-content: center;
  padding: 4px 0;
  color: #6c757d;
}
</style>
