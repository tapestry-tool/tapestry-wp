<template>
  <g>
    <foreignObject class="node-button-wrapper" :x="x" :y="y">
      <button ref="addButton" class="node-button" @click.stop="addNode">
        <tapestry-icon icon="plus"></tapestry-icon>
      </button>
    </foreignObject>
    <line
      v-if="linkDragging"
      :x1="x + 30"
      :x2="linkX"
      :y1="y + 30"
      :y2="linkY"
      stroke="currentColor"
      stroke-width="6"
    ></line>
  </g>
</template>

<script>
import * as d3 from "d3"
import { mapActions, mapGetters } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"
import { bus } from "@/utils/event-bus"

export default {
  components: {
    TapestryIcon,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      linkDragging: false,
      linkX: 0,
      linkY: 0,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
  },
  mounted() {
    bus.$on("mouseover", id => {
      this.target = id
    })

    const addButtonRef = this.$refs.addButton
    d3.select(addButtonRef).call(
      d3
        .drag()
        .on("start", () => {
          this.linkDragging = true
          this.linkX = this.x + 30
          this.linkY = this.y + 30
        })
        .on("drag", () => {
          this.linkX += d3.event.dx
          this.linkY += d3.event.dy
        })
        .on("end", async () => {
          if (this.target !== this.node.id) {
            const target = this.getNode(this.target)
            const shouldAddLink = confirm(
              `Link from ${this.node.title} to ${target.title}?`
            )
            if (shouldAddLink) {
              await this.addLink({ source: this.node.id, target: this.target })
            }
          }
          this.linkDragging = false
          this.linkX = 0
          this.linkY = 0
        })
    )
  },
  methods: {
    ...mapActions(["addLink"]),
    addNode() {
      this.$root.$emit("add-node", this.node.id)
    },
  },
}
</script>
