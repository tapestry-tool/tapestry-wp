<template>
  <section id="tyde-menu-help">
    <tyde-button class="back-button" icon="arrow-left" @click="$emit('back')" />
    <h1>How to Play</h1>
    <p>Click on any icon to play.</p>
    <p>
      Once you are done viewing all the nodes, click the green next arrow to view
      more content.
    </p>
  </section>
</template>

<script>
import TydeButton from "./TydeButton"

export default {
  name: "tyde-menu-help",
  components: {
    TydeButton,
  },
}
</script>

<style lang="scss" scoped>
#tyde-menu-help {
  position: relative;
  width: 40%;

  .back-button {
    position: absolute;
    top: 0;
    left: -3em;
    width: 64px;
    height: 64px;
    font-size: 32px;
  }

  h1 {
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 40px;

    &:before {
      display: none;
    }
  }

  p {
    padding: 0;
    margin-bottom: 1em;
  }
}
</style>
