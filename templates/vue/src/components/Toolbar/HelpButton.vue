<template>
 <div>
     <button
        aria-label="get help"
     >
        <tapestry-icon icon="microphone" @click="showHelpIframe"/>
        <!-- <router-link :to="{ name: 'lightbox' }"> im a link</router-link> -->

     </button>
 </div>
  
</template>

<script>
// import { mapState } from "vuex"

import TapestryIcon from "@/components/common/TapestryIcon"
import { names } from "@/config/routes"
// import { nodeStatus } from "@/utils/constants"

export default {
  components: {
    TapestryIcon,
  },
  data() {
      return {
      showMenu: false,
    }
  },
  methods: {
      showHelpIframe() {
          this.$router.push({
              name: names.LIGHTBOX,
              params: { nodeId: this.$route.params.nodeId},
              query: this.$route.query,
          })
      }
  }
}
</script>

<style lang="scss" scoped>
button {
  padding: 0.5rem;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;

  &.active,
  &:hover {
    background: none;
    color: #11a6d8;
    transform: scale(1.1);
  }
}
</style>