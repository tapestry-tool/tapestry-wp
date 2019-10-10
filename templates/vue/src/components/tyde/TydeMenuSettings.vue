<template>
  <section class="wrapper">
    <tyde-button class="back-button" icon="arrow-left" @click="$emit('back')" />
    <h1 class="title">Settings</h1>
  </section>
</template>

<script>
import TydeButton from "./TydeButton"

export default {
  name: "tyde-menu-settings",
  components: {
    TydeButton,
  },
}
</script>

<style scoped>
.back-button {
  position: absolute;
  top: 0;
  left: -3em;
  width: 64px;
  height: 64px;
  font-size: 32px;
}

.title {
  font-weight: bold;
  text-transform: uppercase;
}

.title:before {
  display: none;
}

.wrapper {
  position: relative;
}
</style>
