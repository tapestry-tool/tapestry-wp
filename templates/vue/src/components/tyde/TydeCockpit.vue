<template>
  <section id="tyde-cockpit" :style="cockpitImage">
    <div v-for="node in modules" :key="node.id">
      <tyde-spaceship-part
        :node="node"
        @click="$emit('show-summary', node.id)"
      ></tyde-spaceship-part>
    </div>
  </section>
</template>

<script>
import { tydeTypes } from "@/utils/constants"
import { mapGetters } from "vuex"
import TydeSpaceshipPart from "@/components/tyde/TydeSpaceshipPart"

export default {
  name: "tyde-cockpit",
  components: {
    TydeSpaceshipPart,
  },
  computed: {
    ...mapGetters(["settings", "nodes"]),
    cockpitImage() {
      return {
        backgroundImage: `url(${this.settings.spaceshipBackgroundUrl})`,
      }
    },
    modules() {
      return this.nodes.filter(this.isNodeModuleType)
    },
  },
  methods: {
    isNodeModuleType(node) {
      return node.tydeType === tydeTypes.MODULE
    },
  },
}
</script>

<style lang="scss" scoped>
#tyde-cockpit {
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  margin: -16px -32px;
  height: calc(100% + 32px);
}
</style>
