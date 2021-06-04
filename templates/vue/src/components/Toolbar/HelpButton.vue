<template>
 <div>
     <button
        aria-label="get help"
        @click="showHelpIframe"
     >
        <tapestry-icon icon="microphone" />
        <!-- <router-link :to="{ name: 'lightbox' }"> im a link</router-link> -->

     </button>
 </div>
  
</template>

<script>
import { mapState } from "vuex"

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
  computed: {
    ...mapState(["settings", "nodes", "rootId"]),
  },
  methods: {
    showHelpIframe() {
        console.log("button working!");
        this.$router.push({
            name: names.LIGHTBOX,
            query: { help: 'true'},
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