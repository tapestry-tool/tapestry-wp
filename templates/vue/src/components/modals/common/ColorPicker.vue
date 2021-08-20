<template>
  <b-container fluid class="bv-example-row">
    <div class="form__field">
      <b-row>
        <div class="form__input">
          <v-swatches
            v-model="color"
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
    }
  },
  watch: {
    color(newColor) {
      this.$emit("change", newColor)
    },
  },
}
</script>

<style lang="scss" scoped>
.swatch {
  margin: 3px 6px -2px -2px;
}
</style>
