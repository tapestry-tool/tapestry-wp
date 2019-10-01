<template>
  <section class="wrapper">
    <TydeButton @click="$emit('back')" class="back-button" icon="arrow-left" />
    <h1 class="title">How to Play</h1>
    <p>Click on any icon to play.</p>
    <p>Once you are done viewing all the nodes, click the green next arrow to view more content.</p>
  </section>
</template>

<script>
import TydeButton from './TydeButton'

export default {
  name: 'tyde-menu-help',
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
  margin-bottom: 40px;
}

.title:before {
  display: none;
}

.wrapper {
  position: relative;
  width: 40%;
}

.wrapper p {
  padding: 0;
  margin-bottom: 1em;
}
</style>
