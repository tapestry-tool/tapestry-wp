<template>
  <div id="app">
    <tapestry />
    <router-view></router-view>
    <tapestry-filter />
  </div>
</template>

<script>
import Tapestry from "./components/Tapestry"
import TapestryFilter from "./components/TapestryFilter"

export default {
  name: "app",
  components: {
    Tapestry,
    TapestryFilter,
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
