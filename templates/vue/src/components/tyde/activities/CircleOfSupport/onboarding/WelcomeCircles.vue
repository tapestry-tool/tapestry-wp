<template>
  <div class="modal ob-font">
    <div class="content top-left">
      <b-container class="confirm top-left">
        <b-row class="py-2 top-left">
          <h2 class="ob-title">
            Now that we have your communities, and connections, we can look at the
            circle View.
          </h2>
        </b-row>
        <b-row align-h="center" class="py-2">
          <h4 class="ob-secondary">
            This the Circle Welcome.
          </h4>
        </b-row>
        <b-row align-h="center" class="mt-2 mb-2">
          <b-overlay :show="loading" rounded="sm">
            <b-button pill variant="secondary" @click="$emit(`continue`)">
              CONTINUE &#8594;
            </b-button>
          </b-overlay>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
// import CosModal from "../CosModal"
export default {
  components: {
    // CosModal,
  },
  data() {
    return {
      loading: false,
    }
  },
}
</script>

<style scoped lang="scss">
.top-left {
  left: 22px;
  top: 95px;
}

.modal {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: flex-start;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: black;
  opacity: 0.4;
}
.content {
  position: relative;
  padding: 2rem;
  background: white;
  border: var(--cos-border);
  border-radius: 1rem;
  max-width: 700px;
}
</style>
