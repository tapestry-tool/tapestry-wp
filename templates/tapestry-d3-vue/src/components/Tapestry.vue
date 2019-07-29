<template>
  <div id="tapestry">
    <RootNodeButton />
  </div>
</template>

<script>
import RootNodeButton from './RootNodeButton'

export default {
  name: 'tapestry',
  components: {
    RootNodeButton
  },
  data() {
    return {
      directoryUrl: wpData.directory_uri
    }
  }
}
</script>

<style scoped>
</style>
