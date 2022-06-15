<template>
  <div class="popup-container">
    <b-form-checkbox :checked="isPopup" @change="togglePopup">
      Show node as popup
    </b-form-checkbox>
    <div v-if="isPopup" class="popup-time-container">
      <label for="popup-time">Popup time in seconds</label>
      <b-form-input
        id="popup-time"
        v-model.number="popupTimeValue"
        type="number"
        required
        min="0"
      ></b-form-input>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"
export default {
  props: {
    isCandidate: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState({
      popup: state => state.currentEditingNode.popup,
    }),
    isPopup() {
      return this.popup != null
    },
    popupTime() {
      return this.isPopup ? this.popupTimeValue : 0
    },
    popupTimeValue: {
      get() {
        return this.popup.time
      },
      set(value) {
        this.update("popup.time", value)
      },
    },
  },
  watch: {
    /* NOTE: This is a fix for a problem where you set a popup for a valid canidate and then change your media type 
             (i.e. Set popup for a text and change it to multi-content). This is necessary as the popup is set inside
             this component and not by the Publish button
    */
    isCandidate() {
      if (!this.isCandidate) {
        this.update("popup", null)
      }
    },
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    togglePopup() {
      if (this.isPopup) {
        this.update("popup", null)
      } else {
        this.update("popup", {
          time: 0,
        })
      }
    },
  },
}
</script>

<style scoped lang="scss">
.popup-container {
  display: flex;
}

.popup-time-container {
  display: flex;
  width: 70%;
  margin-left: auto;

  label {
    font-size: 0.9em;
  }
}
</style>
