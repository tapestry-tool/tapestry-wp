<template>
  <h1>I'm a filter</h1>
</template>

<script>
export default {
  name: "tapestry-filter",
  watch: {
    $route(to, from) {
      console.log(to, from)
    },
  },
}
</script>
