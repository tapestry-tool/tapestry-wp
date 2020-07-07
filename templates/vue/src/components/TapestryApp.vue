<template>
  <loading v-if="loading" style="height: 75vh;"></loading>
  <div v-else>
    <root-node-button
      v-if="!rootId && canEdit"
      @click="addRootNode"
    ></root-node-button>
    <t-toolbar></t-toolbar>
    <main ref="app">
      <tapestry-svg></tapestry-svg>
    </main>
  </div>
</template>

<script>
import DragSelect from "dragselect"
import { mapMutations, mapState } from "vuex"
import Loading from "@/components/Loading"
import TapestrySvg from "@/components/TapestrySvg"
import TToolbar from "@/components/TToolbar"
import RootNodeButton from "@/components/RootNodeButton"
import TapestryApi from "@/services/TapestryAPI"

const client = new TapestryApi(wpPostId)

export default {
  components: {
    Loading,
    TapestrySvg,
    TToolbar,
    RootNodeButton,
  },
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    ...mapState(["tapestryIsLoaded", "rootId", "selection"]),
    canEdit() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
    },
  },
  mounted() {
    const data = [client.getTapestry(), client.getUserProgress()]
    Promise.all(data).then(([dataset, progress]) => {
      this.init({ dataset, progress })
      this.loading = false
      this.$nextTick(this.initializeDragSelect)
    })
  },
  methods: {
    ...mapMutations(["init", "select", "unselect", "clearSelection"]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    initializeDragSelect() {
      document.addEventListener("keydown", evt => {
        if (evt.key === "Escape") {
          this.clearSelection()
        }
      })

      new DragSelect({
        selectables: document.querySelectorAll(".node"),
        area: this.$refs.app,
        onDragStart: evt => {
          if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
            return
          }
          this.clearSelection()
        },
        onElementSelect: el => this.select(el.dataset.id),
        onElementUnselect: el => this.unselect(el.dataset.id),
      })
    },
  },
}
</script>

<style lang="scss" scoped>
main {
  position: relative;
}
</style>
