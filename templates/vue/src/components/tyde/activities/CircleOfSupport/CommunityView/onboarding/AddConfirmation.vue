<template>
  <cos-modal show @change="$emit('later')">
    <div class="confirm">
      <h1>Great job! Here are all your communities.</h1>
      <p>Would you like to add another community?</p>
      <ul class="controls">
        <li>
          <button class="secondary" @click="$emit('later')">Maybe later</button>
        </li>
        <li>
          <button class="primary" @click="$emit('another')">
            Add another
          </button>
        </li>
      </ul>
    </div>
  </cos-modal>
</template>

<script>
import CosModal from "../CosModal"

export default {
  components: {
    CosModal,
  },
}
</script>
