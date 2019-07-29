<template>
  <div id="tapestry">
    <RootNodeButton />
    <NodeModal/>
  </div>
</template>

<script>
import NodeModal from './NodeModal'
import RootNodeButton from './RootNodeButton'

export default {
  name: 'tapestry',
  components: {
    NodeModal,
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
