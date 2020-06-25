<template>
  <section id="tyde-menu-help">
    <h1>Do you need help with this game?</h1>
    <p>If you are wondering how to play this game, click on the "Welcome" planet.</p>
    <p>
      Send an email to
      <a href="mailto:ask@tyde.ca">ask@tyde.ca</a>
      and we'll be happy to help you out!
    </p>
  </section>
</template>

<script>
export default {
  name: "tyde-menu-help",
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
    font-size: 2em;
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
