<template>
  <g>
    <line
      v-if="linkDragging"
      :x1="x"
      :x2="linkX"
      :y1="y"
      :y2="linkY"
      stroke="currentColor"
      stroke-width="6"
    ></line>
    <node-button
      ref="addButton"
      :data-qa="`add-node-${node.id}`"
      :x="x"
      :y="y"
      :fill="fill"
      @click="addNode"
    >
      <tapestry-icon icon="plus" svg></tapestry-icon>
    </node-button>
  </g>
</template>

<script>
import * as d3 from "d3"
import { mapActions, mapGetters, mapState } from "vuex"
import { names } from "@/config/routes"
import { bus } from "@/utils/event-bus"
import client from "@/services/TapestryAPI"
import TapestryIcon from "@/components/common/TapestryIcon"
import NodeButton from "./NodeButton"

export default {
  components: {
    NodeButton,
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
    fill: {
      type: String,
      required: false,
      default: "#666",
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
    ...mapGetters(["getNode", "isMultiContent"]),
  },
  mounted() {
    bus.$on("mouseover", id => {
      this.target = id
    })

    const addButtonRef = this.$refs.addButton.$el
    d3.select(addButtonRef).call(
      d3
        .drag()
        .on("start", () => {
          this.linkDragging = true
          this.linkX = this.x + 30
          this.linkY = this.y + 30
        })
        .on("drag", event => {
          this.linkX += event.dx
          this.linkY += event.dy
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
                  this.isMultiContent(link.source.id) &&
                  this.isMultiContent(link.target.id)
                ) {
                  return { state: "NORMAL", data: link }
                }
                if (
                  this.isMultiContent(link.source.id) ||
                  this.isMultiContent(link.target.id)
                ) {
                  return {
                    state: "ADD-ROW",
                    data: {
                      source: this.isMultiContent(link.source.id)
                        ? link.source
                        : link.target,
                      target: this.isMultiContent(link.source.id)
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
        query: this.$route.query,
      })
      client.recordAnalyticsEvent("user", "click", "edit-node-button", this.node.id)
    },
  },
}
</script>
