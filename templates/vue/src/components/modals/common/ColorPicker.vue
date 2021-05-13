<template>
<b-container fluid class="bv-example-row">
  <div class="form__field">
    
    <b-row>
    <div class="form__label">
      <p>{{content}}</p>
    </div>
    <div class="form__input">
      <v-swatches
    
        v-model="color"
        
        show-fallback
        fallback-input-type="color"
        
        popover-x="left"
        class = "swatch"
      ></v-swatches>
    </div>
    </b-row>
    
  </div>
</b-container>
</template>

<script>
import VSwatches from 'vue-swatches'
import "vue-swatches/dist/vue-swatches.css"

export default {
 name: "color-picker",
 components: { VSwatches },
 props: {
    content: {
      type: String,
      required: true,
      default: "",
    },
    currentColor: {
      type: String,
      required: true,
      default: "",
    }
 },
 data () {
    return {
      color: this.currentColor,
    }
  },
  watch: {
    color(newColor) {
      this.$emit("change",newColor)
    }
  }
}
</script>

<style lang="scss" scoped>
.swatch {
  margin-left: 10px;
}
</style>