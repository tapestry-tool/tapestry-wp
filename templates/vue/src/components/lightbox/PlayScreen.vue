<template>
  <div class="wrapper">
    <button class="button-play" @click="$emit('play')">
      <i class="far fa-play-circle fa-4x"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: "play-screen",
}
</script>

<style lang="scss" scoped>
.wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
}

.button-play {
  margin: auto;
  background: none;
  padding: 0;
  color: white;
}
</style>
