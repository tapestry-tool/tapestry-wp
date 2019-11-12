<template>
  <div
    :class="[
      'end-screen',
      {
        'end-screen--hide': !showEndScreen,
      },
    ]"
  >
    <button class="end-screen-button" @click="rewatch">
      <i class="fas fa-redo fa-4x"></i>
      <p class="end-screen-button-text">Rewatch</p>
    </button>
    <button class="end-screen-button" @click="close">
      <i class="far fa-times-circle fa-4x"></i>
      <p class="end-screen-button-text">Close</p>
    </button>
  </div>
</template>

<script>
export default {
  name: "end-screen",
}
</script>

<style scoped>
.end-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  color: black;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  z-index: 10;
}

.end-screen--hide {
  opacity: 0;
  pointer-events: none;
}

.end-screen-button {
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: inherit;
  margin-right: 3em;
}

.end-screen-button:last-child {
  margin-right: 0;
}

.end-screen-button:hover {
  color: #11a6d8;
}

.end-screen-button-text {
  margin: 0;
  padding: 0;
  font-weight: 600;
  margin-top: 1em;
}
</style>
