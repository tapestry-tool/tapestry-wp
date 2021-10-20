<template>
  <ul class="circle-container">
    <connections-tab
      ref="connectionsTab"
      class="tab"
      :connections="connections"
      :communities="communities"
      :toolTipPositioned="toolTipPositioned"
      :draggable="!dragDisabled"
      @connection-submitted="$emit('connection-submitted')"
      @add-community="$emit('add-community', $event)"
      @delete-connection="$emit('delete-connection', $event)"
      @back="handleBack"
      @add-connection="handleAddConnection"
      @connection-opened="handleConnectionOpened"
      @edit-connection="handleEditConnection"
      @drag:start="handleDragStart"
      @drag:move="handleDragMove"
      @drag:end="handleDragEnd"
      @connection-closed="handleConnectionClosed"
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
        '--background': getCircleBackground(index),
      }"
      class="circle"
    >
      <ul
        v-show="activeCircle > 2 || activeCircle === index"
        class="connection-list"
      >
        <single-connection
          v-for="connection in circle.connections"
          :key="connection.id"
          :ref="connection.id"
          :style="{ '--x': connection.x, '--y': connection.y }"
          :connection="connection"
          class="connection"
          size="sm"
          variant="name"
          :draggable="!dragDisabled"
          @click="toggleConnectionTooltip(connection.id)"
          @drag:start="handleDragStart"
          @drag:move="handleDragMove"
          @drag:end="handleDragEnd"
        />
      </ul>
    </li>
    <circle-toggle v-model="activeCircle" class="circle-toggle" />
    <connection-tooltip
      ref="connection-tooltip"
      class="connection-tooltip"
      :connection="activeConnection"
      :show="activeConnectionId != null"
      @edit="editConnection(activeConnection)"
      @close="activeConnectionId = null"
    />
    <div
      v-show="draggingConnection && draggingConnection.avatar"
      ref="dragging-connection"
      class="draggable"
      v-html="
        getEmojiImgFromUnicode(draggingConnection && draggingConnection.avatar)
      "
    />
    <div class="user">
      <img
        height="40"
        width="40"
        src="https://twemoji.maxcdn.com/v/13.1.0/72x72/1f60a.png"
      />
    </div>
    <avataaars
      class="user"
      :isCircle="currentAvatar.isCircle"
      :circleColor="currentAvatar.circleColor"
      :accessoriesType="currentAvatar.accessoriesType"
      :clotheType="currentAvatar.clotheType"
      :clotheColor="currentAvatar.clotheColor"
      :eyebrowType="currentAvatar.eyebrowType"
      :eyeType="currentAvatar.eyeType"
      :facialHairColor="currentAvatar.facialHairColor"
      :facialHairType="currentAvatar.facialHairType"
      :graphicType="currentAvatar.graphicType"
      :hairColor="currentAvatar.hairColor"
      :mouthType="currentAvatar.mouthType"
      :skinColor="currentAvatar.skinColor"
      :topType="currentAvatar.topType"
      :topColor="currentAvatar.topColor"
    ></avataaars>
    <onboarding
      :communities="communities"
      :connections="connections"
      :circles="circles"
      :has-connection-in-circles="hasConnectionInCircles"
      :parent-state="state"
      :activeView="activeView"
      @tooltip-positioned="handleToolTipPositioned"
      @tooltip-removed="handleTooltipRemoved"
    />
  </ul>
</template>

<script>
import Twemoji from "twemoji"
import avatarOptions from "@/components/modals/UserSettingsModal/avatarOptions.js"
import Helpers from "@/utils/Helpers"
import client from "@/services/TapestryAPI"
import OnBoarding from "../onboarding/index.vue"
import ConnectionsTab from "../ConnectionsTab"
import ConnectionTooltip from "../ConnectionTooltip"
import SingleConnection from "../SingleConnection"
import CircleToggle from "./CircleToggle"
import { CircleStates } from "./states"
import Avataaars from "vuejs-avataaars"
import { mapState } from "vuex"

const CONNECTION_SPACE = 0
const CONNECTION_OFFSET = 46
const MIN_CIRCLE_SIZE = 105
const OFFSET_SIZE = MIN_CIRCLE_SIZE * 0.85
const USER_AVATAR_SPACE = 20

const States = {
  Home: 0,
  EditConnection: 1,
  ConnectionClosed: 4,
  AddConnection: 5,
  MoveConnection: 6,
  ConnectionOpened: 7,
}

export default {
  components: {
    ConnectionsTab,
    CircleToggle,
    ConnectionTooltip,
    SingleConnection,
    onboarding: OnBoarding,
    Avataaars,
  },
  model: {
    prop: "circles",
    event: "change",
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
    circles: {
      type: Array,
      required: true,
    },
    activeView: {
      type: Number,
      required: true,
    },
    hasConnectionInCircles: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      activeCircle: CircleStates.All,
      activeCircleOrig: null,
      state: States.Home,
      lastState: States.Home,
      activeConnectionId: null,
      draggingConnection: null,
      toolTipPositioned: false,
      dragDisabled: false,
    }
  },
  computed: {
    ...mapState(["avatar"]),
    currentAvatar() {
      if (this.avatar && Object.keys(this.avatar).length) {
        return this.avatar
      }
      return avatarOptions.defaultAvatar
    },
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
      const connection = this.connections[this.activeConnectionId]
      return {
        ...connection,
        communities: Object.values(this.communities).filter(({ connections }) =>
          connections.includes(this.activeConnectionId)
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
          connections: connections.map((connectionId, index) => ({
            ...this.connections[connectionId],
            ...this.getPosition({
              index,
              radius: radius - CONNECTION_OFFSET,
              size: connections.length,
            }),
          })),
          radius: `${radius}px`,
        }
      })
    },
  },
  watch: {
    state(_, lastState) {
      this.lastState = lastState
    },
  },
  methods: {
    getCircleBackground(index) {
      if (this.activeCircle === index) {
        return `hsl(0, 0%, 93%)`
      }
      return "white"
    },
    getEmojiImgFromUnicode(unicode) {
      let div = document.createElement("div")
      div.textContent = unicode
      return Twemoji.parse(div).innerHTML
    },
    handleDragStart({ x, y, connection }) {
      this.activeCircleOrig = this.activeCircle
      this.timeout = setTimeout(() => {
        this.draggingConnection = connection
        this.$refs.connectionsTab.hide()

        // Close the tooltip on drag
        this.activeConnectionId = null
        this.handleDragMove({ x, y })
      }, 150)
    },
    handleDragMove({ x, y }) {
      this.state = States.MoveConnection
      const connectionRef = this.$refs["dragging-connection"]
      connectionRef.style.setProperty("--x", `${x}px`)
      connectionRef.style.setProperty("--y", `${y}px`)
      this.activeCircle = this.getActiveCircle(connectionRef)
    },
    async handleDragEnd() {
      clearTimeout(this.timeout)

      if (this.draggingConnection) {
        const oldCircle = this.getCircle(this.draggingConnection.id)
        if (
          oldCircle != this.activeCircle &&
          this.activeCircle !== CircleStates.All
        ) {
          this.addConnectionToCircle(this.activeCircle, this.draggingConnection.id)
          this.activeCircle = CircleStates.All
        } else {
          if (this.activeCircle === CircleStates.All) {
            this.removeConnectionFromCircles(this.draggingConnection.id)
          }
          this.activeCircle = this.activeCircleOrig
        }

        const connectionRef = this.$refs["dragging-connection"]
        connectionRef.style.setProperty("--x", `0px`)
        connectionRef.style.setProperty("--y", `0px`)
        this.draggingConnection = null
        setTimeout(() => this.$refs.connectionsTab.show(), 300)
      } else {
        this.activeCircle = this.activeCircleOrig
      }
    },
    getCircle(connectionId) {
      const circle = this.circles.findIndex(circle => circle.includes(connectionId))
      if (circle < 0) {
        return null
      }
      return circle
    },
    addConnectionToCircle(circle, connectionId) {
      this.dragDisabled = true

      // First do it locally, for responsive UX
      const circles = [...this.circles]
      circles.forEach((circleObj, circleIndex) => {
        circles[circleIndex] = circles[circleIndex].filter(id => id !== connectionId)
      })
      const connections = circles[circle]
      if (!connections.includes(connectionId)) {
        circles[circle] = [...circles[circle], connectionId]
      }
      this.$emit("change", circles)

      // Then do it on server (and update locally in case of errors)
      return client.cos
        .addConnectionToCircle(circle, connectionId)
        .then(newCircles => {
          this.$emit("change", newCircles)
          this.dragDisabled = false
        })
    },
    removeConnectionFromCircles(connectionId) {
      this.dragDisabled = true

      // First do it locally, for responsive UX
      const circles = [...this.circles]
      circles.forEach((circleObj, circleIndex) => {
        circles[circleIndex] = circles[circleIndex].filter(id => id !== connectionId)
      })
      this.$emit("change", circles)

      // Then do it on server (and update locally in case of errors)
      return client.cos
        .removeConnectionFromCircles(connectionId)
        .then(newCircles => {
          this.$emit("change", newCircles)
          this.dragDisabled = false
        })
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
        return (
          Math.max(numConnections * CONNECTION_SPACE, MIN_CIRCLE_SIZE) +
          USER_AVATAR_SPACE
        )
      }
      return Math.max(
        numConnections * CONNECTION_SPACE,
        OFFSET_SIZE + this.getRadius(index - 1)
      )
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
      this.$refs.connectionsTab.editConnection(connection)
    },
    handleBack() {
      if (this.state === States.EditConnection) {
        this.state = States.Home
        this.$refs.connectionsTab.close()
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
          connectionRef.$el,
          tooltipRef,
          document.getElementById("cos")
        )
      )
    },
    handleAddConnection(event) {
      this.state = States.AddConnection
      this.$emit("add-connection", event)
    },
    handleConnectionOpened() {
      this.state = States.ConnectionOpened
    },
    handleConnectionClosed() {
      if (this.state === States.ConnectionClosed) {
        this.state === States.Home
      } else {
        this.state = States.ConnectionClosed
      }
    },
    handleToolTipPositioned() {
      this.toolTipPositioned = true
    },
    handleTooltipRemoved() {
      this.toolTipPositioned = false
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
  background: var(--background);
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
  max-width: 8em;
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

.user {
  position: absolute;
  height: 90px;
  width: 90px;
  top: 48.5%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  z-index: 60;
}
</style>
