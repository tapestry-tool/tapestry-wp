<template>
  <ul class="circle-container">
    <connections-tab
      ref="connections"
      class="tab"
      :connections="connections"
      :communities="communities"
      draggable
      @back="handleBack"
      @add-connection="$emit('add-connection', $event)"
      @edit-connection="handleEditConnection"
      @add-community="$emit('add-community', $event)"
      @drag:start="handleDragStart"
      @drag:move="handleDragMove"
      @drag:end="handleDragEnd"
    />
    <li
      v-for="(circle, index) in circlesWithData"
      ref="circles"
      :key="index"
      :style="{
        '--index': index,
        '--border-width': circle.borderWidth,
        '--order': circle.order,
        '--radius': circle.radius,
      }"
      class="circle"
    >
      <ul
        v-show="activeCircle > 2 || activeCircle === index"
        class="connection-list"
      >
        <li
          v-for="connection in circle.connections"
          :key="connection.id"
          :ref="connection.id"
          :style="{ '--x': connection.x, '--y': connection.y }"
          class="connection"
          @click="toggleConnectionTooltip(connection.id)"
        >
          {{ connection.avatar }}
        </li>
      </ul>
    </li>
    <div class="controls">
      <p>Circle: {{ activeCircle }}</p>
      <button @click="addConnection">Add connection</button>
      <button @click="removeConnection">Remove connection</button>
    </div>
    <circle-toggle v-model="activeCircle" class="circle-toggle" />
    <connection-tooltip
      ref="connection-tooltip"
      class="connection-tooltip"
      :connection="activeConnection"
      :show="activeConnectionId != null"
      @edit="editConnection(activeConnection)"
      @close="activeConnectionId = null"
    />
    <div v-show="draggingConnection" ref="dragging-connection" class="draggable">
      {{ draggingConnection && draggingConnection.avatar }}
    </div>
  </ul>
</template>

<script>
import Helpers from "@/utils/Helpers"

import ConnectionsTab from "../ConnectionsTab"
import ConnectionTooltip from "../ConnectionTooltip"
import CircleToggle from "./CircleToggle"

const CONNECTION_SPACE = 10
const MIN_CIRCLE_SIZE = 125
const OFFSET_SIZE = MIN_CIRCLE_SIZE * 0.75

const States = {
  Home: 0,
  EditConnection: 1,
}

const CircleStates = {
  All: 3,
  One: 0,
  Two: 1,
  Three: 2,
}

export default {
  components: {
    ConnectionsTab,
    CircleToggle,
    ConnectionTooltip,
  },
  props: {
    communities: {
      type: Object,
      required: true,
    },
    connections: {
      type: Object,
      required: true,
    },
  },
  // STUB: Change this to props
  data() {
    return {
      circles: [[], [], []],
      activeCircle: CircleStates.All,
      state: States.Home,
      activeConnectionId: null,
      draggingConnection: null,
    }
  },
  computed: {
    activeConnection() {
      if (!this.activeConnectionId) {
        return {
          name: "placeholder",
          avatar: "😊",
          communities: [
            {
              id: "placeholder",
              color: "var(--cos-color-secondary)",
            },
          ],
        }
      }
      const [connectionId] = this.activeConnectionId.split("-")
      const connection = this.connections[connectionId]
      return {
        ...connection,
        communities: Object.values(this.communities).filter(({ connections }) =>
          connections.includes(connectionId)
        ),
      }
    },
    circlesWithData() {
      return this.circles.map((connections, index) => {
        const order = this.circles.length - index
        const radius = this.getRadius(index)
        return {
          order,
          borderWidth: `${order}px`,
          connections: connections.map((connection, index) => ({
            ...connection,
            ...this.getPosition({
              index,
              radius: radius - 32,
              size: connections.length,
            }),
          })),
          radius: `${radius}px`,
        }
      })
    },
  },
  methods: {
    handleDragStart({ x, y, connection }) {
      this.draggingConnection = connection
      this.handleDragMove({ x, y })
    },
    handleDragMove({ x, y }) {
      const connectionRef = this.$refs["dragging-connection"]
      connectionRef.style.setProperty("--x", `${x}px`)
      connectionRef.style.setProperty("--y", `${y}px`)
      this.activeCircle = this.getActiveCircle(connectionRef)
    },
    handleDragEnd() {
      if (this.activeCircle !== CircleStates.All) {
        this.circles[this.activeCircle].push(this.draggingConnection)
        this.activeCircle = CircleStates.All
      }

      const connectionRef = this.$refs["dragging-connection"]
      connectionRef.style.setProperty("--x", `0px`)
      connectionRef.style.setProperty("--y", `0px`)
      this.draggingConnection = null
    },
    /**
     * Gets the circle the ref is currently hovering over. If it's not hovering over
     * any circle, return `CircleStates.All`.
     */
    getActiveCircle(ref) {
      const circles = this.$refs.circles

      const refBox = ref.getBoundingClientRect()
      const circleBoxes = circles.map(ref => ref.getBoundingClientRect())

      /**
       * Find the _first_ circle whose bounding box contains the floating
       * connection's bounding box. This works because the circles are placed in
       * reverse order (i.e. smallest circle is first in the ref array).
       */
      const matchingCircle = circleBoxes.findIndex(circleBox => {
        const { x, y } = refBox
        const xMax = circleBox.x + circleBox.width
        const yMax = circleBox.y + circleBox.height
        return x >= circleBox.x && x <= xMax && y >= circleBox.y && y <= yMax
      })

      if (matchingCircle >= 0) {
        return matchingCircle
      }

      return CircleStates.All
    },
    getRadius(index) {
      const numConnections = this.circles[index].length
      if (index === 0) {
        return Math.max(numConnections * CONNECTION_SPACE, MIN_CIRCLE_SIZE)
      }
      return Math.max(
        numConnections * CONNECTION_SPACE,
        OFFSET_SIZE + this.getRadius(index - 1)
      )
    },
    addConnection() {
      const connection = {
        id: Helpers.createUUID(),
        name: "nan",
        avatar: "😀",
        communities: ["603e883568aae", "603e884ee69c1"],
      }
      this.circles[this.activeCircle].push(connection)
    },
    removeConnection() {
      this.circles[this.activeCircle].pop()
    },
    getPosition({ index, radius, size }) {
      const angle = ((2 * Math.PI) / size) * index - Math.PI / 2
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      return {
        x: `${x}px`,
        y: `${y}px`,
      }
    },
    editConnection(connection) {
      this.activeConnectionId = null
      this.state = States.EditConnection
      this.$refs.connections.editConnection(connection)
    },
    handleBack() {
      if (this.state === States.EditConnection) {
        this.state = States.Home
        this.$refs.connections.close()
      }
    },
    handleEditConnection(event) {
      this.handleBack()
      this.$emit("edit-connection", event)
    },
    toggleConnectionTooltip(connectionId) {
      if (connectionId === this.activeConnectionId) {
        this.activeConnectionId = null
        return
      }
      this.activeConnectionId = connectionId
      this.activeCommunityTooltipId = null

      const [connectionRef] = this.$refs[connectionId]
      const tooltipRef = this.$refs["connection-tooltip"].$el
      this.$nextTick(() =>
        Helpers.positionTooltip(
          connectionRef,
          tooltipRef,
          document.getElementById("cos")
        )
      )
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.circle-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  position: absolute;
  border: var(--border-width, 2px) solid var(--cos-color-secondary);
  width: calc(var(--radius) * 2);
  height: calc(var(--radius) * 2);
  border-radius: 50%;
  z-index: calc(var(--order) * 10);
}

.controls {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
}

.connection-list {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.connection {
  position: absolute;
  transform: translate(var(--x), var(--y));
  font-size: 3rem;
}

button:not(.circle-toggle) {
  display: block;
  width: 100%;
  font-size: 0.8em;
}

.tab {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}

.circle-toggle {
  position: absolute;
  top: 2rem;
  right: 2rem;
}

.connection-tooltip {
  top: 0;
  left: 0;
  z-index: 70;
}

.draggable {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  font-size: 4rem;
  transform: translate(calc(var(--x) - 50%), calc(var(--y) - 50%));
}
</style>
