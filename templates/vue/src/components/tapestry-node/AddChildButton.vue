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
import { mapActions, mapGetters, mapState } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"
import { names } from "@/config/routes"
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
    ...mapState(["links"]),
    ...mapGetters(["getNode", "isAccordion"]),
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
          const linkExists = this.links.find(link => {
            if (link.source === this.node.id && link.target === this.target) {
              return true
            }
            return link.target === this.node.id && link.source === this.target
          })
          if (!linkExists && this.target !== this.node.id) {
            const target = this.getNode(this.target)
            const shouldAddLink = confirm(
              `Link from ${this.node.title} to ${target.title}?`
            )

            if (shouldAddLink) {
              const getLinkState = link => {
                if (
                  this.isAccordion(link.source.id) &&
                  this.isAccordion(link.target.id)
                ) {
                  return { state: "NORMAL", data: link }
                }
                if (
                  this.isAccordion(link.source.id) ||
                  this.isAccordion(link.target.id)
                ) {
                  return {
                    state: "ADD-ROW",
                    data: {
                      source: this.isAccordion(link.source.id)
                        ? link.source
                        : link.target,
                      target: this.isAccordion(link.source.id)
                        ? link.target
                        : link.source,
                    },
                  }
                }
                return { state: "NORMAL", data: link }
              }

              const { state, data } = getLinkState({ source: this.node, target })
              if (state === "ADD-ROW") {
                alert(
                  `${data.target.title} will be added as a row of ${data.source.title}`
                )
                data.source.childOrdering.push(data.target.id)
              }
              await this.addLink({ source: data.source.id, target: data.target.id })
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
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: this.node.id, type: "add", tab: "content" },
      })
    },
  },
}
</script>
