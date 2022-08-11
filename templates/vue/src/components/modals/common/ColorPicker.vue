<template>
  <b-container fluid class="bv-example-row">
    <div class="form__field">
      <b-row>
        <div class="form__input">
          <v-swatches
            ref="swatches"
            v-model="color"
            :swatches="swatches"
            show-fallback
            show-border
            shapes="circles"
            swatch-size="30"
            :trigger-style="{
              width: '20px',
              height: '20px',
              border: 'solid 1px #aaa',
            }"
            :wrapper-style="{ zIndex: 1000 }"
            fallback-input-type="color"
            row-length="8"
            popover-x="right"
            class="swatch"
            @open="handlePickerOpen"
            @close="handlePickerClose"
          ></v-swatches>
        </div>
        <div v-if="label" class="form__label">
          <p>{{ label }}</p>
        </div>
      </b-row>
    </div>
  </b-container>
</template>

<script>
import VSwatches from "vue-swatches"
import "vue-swatches/dist/vue-swatches.css"

const swatches = [
  { color: "#1FBC9C", label: "Light Sea Green" },
  { color: "#1CA085", label: "Jungle Green" },
  { color: "#2ECC70", label: "Emerald" },
  { color: "#27AF60", label: "Green" },
  { color: "#3398DB", label: "Blue" },
  { color: "#2980B9", label: "Dark Blue" },
  { color: "#A463BF", label: "Amethyst" },
  { color: "#8E43AD", label: "Purple" },
  { color: "#3D556E", label: "Dimmed Blue" },
  { color: "#222F3D", label: "Dark Grey" },
  { color: "#F2C511", label: "Yellow" },
  { color: "#F39C19", label: "Orange" },
  { color: "#E84B3C", label: "Carmine Pink" },
  { color: "#C0382B", label: "Dark Red" },
  { color: "#DDE6E8", label: "Silver" },
  { color: "#BDC3C8", label: "Platinum" },
]

export default {
  name: "color-picker",
  components: { VSwatches },
  props: {
    label: {
      type: String,
      required: false,
      default: "",
    },
    currentColor: {
      type: String,
      required: true,
      default: "",
    },
  },
  data() {
    return {
      color: this.currentColor,
      swatches: swatches,
    }
  },
  watch: {
    color(newColor, oldColor) {
      this.$emit("change", newColor)

      this.updateColorLabel(newColor, oldColor)
    },
  },
  mounted() {
    // improve accessibility on the vue-swatches trigger
    const trigger = this.$refs.swatches.$el.querySelector(".vue-swatches__trigger")
    trigger.setAttribute("tabindex", "0")
    trigger.setAttribute("aria-label", this.label)
    trigger.addEventListener("keyup", evt => {
      if (evt.code === "Enter" || evt.code === "Space") {
        evt.preventDefault()
        trigger.click()
      }
    })
    this.updateColorLabel(this.color, null)
  },
  methods: {
    handlePickerOpen() {
      this.$nextTick(() => {
        this.$refs.swatches.$el.querySelector(".vue-swatches__swatch").focus()
      })
    },
    handlePickerClose() {
      this.$nextTick(() => {
        this.$refs.swatches.$el.querySelector(".vue-swatches__trigger").focus()
      })
    },
    updateColorLabel(newColor, oldColor) {
      const oldIndex = swatches.findIndex(color => color.color === oldColor)
      const newIndex = swatches.findIndex(color => color.color === newColor)
      if (oldIndex !== -1) {
        this.$refs.swatches.$el
          .querySelectorAll(".vue-swatches__swatch")
          [oldIndex]?.setAttribute("aria-label", swatches[oldIndex].label)
      }
      if (newIndex !== -1) {
        this.$refs.swatches.$el
          .querySelectorAll(".vue-swatches__swatch")
          [newIndex]?.setAttribute(
            "aria-label",
            swatches[newIndex].label + ", Selected"
          )
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.swatch {
  margin: 3px 6px -2px -2px;
}
</style>
