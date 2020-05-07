<template>
  <div id="app">
    <tapestry />
    <tapestry-svg />
    <router-view></router-view>
  </div>
</template>

<script>
import Tapestry from "./components/Tapestry"
import TapestrySvg from "./components/TapestrySvg"

export default {
  name: "app",
  components: {
    Tapestry,
    TapestrySvg,
  },
}
</script>

<style lang="scss">
html {
  font-size: 100%;

  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;

    h1:before {
      content: none;
    }

    p {
      padding: 0;
    }

    a {
      color: #42b983;
    }

    button:focus {
      outline: none;
    }
  }
}
</style>
