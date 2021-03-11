<template>
  <ul class="community-area" :style="{ '--cols': columns }">
    <li
      v-for="community in communitiesWithPosition"
      :key="community.id"
      :class="[
        'community-wrapper',
        community.position.orientation,
        { active: community.id === activeCommunity },
      ]"
      :style="{
        '--column-start': community.position.column,
        '--column-end': community.position.columnEnd,
        '--row': community.position.row,
      }"
    >
      <div
        :class="['community', community.position.orientation]"
        :style="{
          '--color': community.color,
        }"
      >
        <button
          :ref="`${community.id}-icon`"
          class="community-icon"
          @click="toggleCommunityTooltip(community.id)"
        >
          {{ community.icon }}
        </button>
        <button
          v-if="clickables[community.id]"
          class="toggle"
          @click="toggle(community.id)"
        >
          <tapestry-icon icon="chevron-down" />
        </button>
        <ul
          :ref="`${community.id}-list`"
          :data-orientation="community.position.orientation"
          :class="[
            'connection-list',
            community.position.orientation,
            { odd: isOdd(community.connections.length) },
          ]"
        >
          <li
            v-for="connection in community.connections"
            :key="connection.id"
            :ref="`${connection.id}-${community.id}`"
          >
            <button
              class="connection"
              @click="toggleConnectionInfo(connection.id, community.id)"
            >
              <p>{{ connection.name }}</p>
              <h1>{{ connection.avatar }}</h1>
            </button>
          </li>
        </ul>
      </div>
    </li>
    <div
      ref="connection-tooltip"
      :class="['connection-tooltip', { active: isTooltipVisible }]"
    >
      <div class="info">
        <p>{{ activeConnection.name }}</p>
        <h1>
          {{ activeConnection.avatar }}
        </h1>
        <ul class="community-list">
          <li
            v-for="community in activeConnection.communities"
            :key="community.id"
            :style="`--community-color: ${community.color}`"
          ></li>
        </ul>
      </div>
      <div class="controls">
        <button @click="editConnection">
          <tapestry-icon icon="pencil-alt" />
        </button>
        <button @click="activeConnectionId = null">
          <tapestry-icon icon="times" />
        </button>
      </div>
    </div>
    <div
      v-show="isCommunityTooltipVisible"
      ref="community-tooltip"
      class="community-tooltip"
    >
      <p>{{ activeCommunityTooltip.icon }}</p>
      <h1>
        {{ activeCommunityTooltip.name }}
      </h1>
      <button @click="editCommunity(activeCommunityTooltip)">
        <tapestry-icon icon="pencil-alt" />
      </button>
      <button @click="toggleCommunityTooltip(activeCommunityTooltip.id)">
        <tapestry-icon icon="times" />
      </button>
    </div>
  </ul>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
import Helpers from "@/utils/Helpers"

export default {
  components: {
    TapestryIcon,
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
  data() {
    return {
      clickables: {},
      activeCommunity: "",
      activeConnectionId: null,
      activeCommunityTooltipId: null,
    }
  },
  computed: {
    columns() {
      return Object.values(this.communities).length > 4
        ? `minmax(0, 1fr) repeat(2, var(--size)) minmax(0, 1fr)`
        : `minmax(0, 1fr) calc(var(--size) * 2) minmax(0, 1fr)`
    },
    communitiesWithPosition() {
      return Object.values(this.communities).map(
        (community, index, communities) => ({
          ...community,
          position: this.getPosition(index, communities.length),
          connections: community.connections.map(id => ({
            ...this.connections[id],
          })),
        })
      )
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
      const [connectionId] = this.activeConnectionId.split("-")
      const connection = this.connections[connectionId]
      return {
        ...connection,
        communities: Object.values(this.communities).filter(({ connections }) =>
          connections.includes(connectionId)
        ),
      }
    },
    activeCommunityTooltip() {
      return this.communities[this.activeCommunityTooltipId] || {}
    },
    isTooltipVisible() {
      return this.activeConnectionId !== null
    },
    isCommunityTooltipVisible() {
      return this.activeCommunityTooltipId !== null
    },
  },
  /**
   * Imperatively update whether the community is clickable or not. Have to do it
   * this way because we determine if a community is clickable using $refs, and
   * since Vue updates the DOM asynchronously, we can't immediately access the $refs.
   */
  mounted() {
    this.$nextTick(() => this.updateClickables())
  },
  updated() {
    this.$nextTick(() => this.updateClickables())
  },
  methods: {
    editCommunity(community) {
      this.$emit("edit-community", community)
      this.activeCommunityTooltipId = null
    },
    editConnection() {
      this.$emit("edit-connection", this.activeConnection)
      this.activeConnectionId = null
    },
    toggleCommunityTooltip(communityId) {
      if (this.activeCommunityTooltipId === communityId) {
        this.activeCommunityTooltipId = null
        return
      }
      this.activeCommunityTooltipId = communityId
      this.activeConnectionId = null

      const [communityRef] = this.$refs[`${communityId}-icon`]
      const tooltipRef = this.$refs["community-tooltip"]
      this.$nextTick(() => this.positionTooltip(communityRef, tooltipRef))
    },
    toggleConnectionInfo(connectionId, communityId) {
      const refName = `${connectionId}-${communityId}`
      if (refName === this.activeConnectionId) {
        this.activeConnectionId = null
        return
      }
      this.activeConnectionId = refName
      this.activeCommunityTooltipId = null

      const [connectionRef] = this.$refs[`${connectionId}-${communityId}`]
      const tooltipRef = this.$refs["connection-tooltip"]
      this.$nextTick(() => this.positionTooltip(connectionRef, tooltipRef))
    },
    /**
     * Positions the connection tooltip according to the given connectionId.
     *
     * This function works by taking the bounding box of the connection trigger and
     * translating the tooltip according to that box.
     *
     * Two things to note — (1) the tooltip is placed on the BOTTOM of the
     * connection, and (2) the tooltip is wider than the connection button. This
     * means there are three edge cases we have to consider:
     *
     * 1. The tooltip is clipped on the RIGHT side (when the connection is on the
     *    right of the CoS)
     * 2. The tooltip is clipped on the BOTTOM (when the connection is on the bottom
     *    of the CoS)
     * 3. The tooltip is clipped on BOTH the bottom and the right (when the
     *    connection is on the bottom-right of the CoS)
     */
    positionTooltip(target, tooltip) {
      const {
        height: tooltipHeight,
        width: tooltipWidth,
      } = tooltip.getBoundingClientRect()
      const { left, bottom, width, top } = target.getBoundingClientRect()
      const containerBox = document.getElementById("cos").getBoundingClientRect()

      /**
       * First, calculate the x and y values without considering clipping (but make
       * sure they're still within bounds).
       */
      let x = Helpers.clamp(
        0,
        left - containerBox.left,
        containerBox.width - tooltipWidth
      )

      let y = Helpers.clamp(
        0,
        bottom - containerBox.top,
        containerBox.height - tooltipHeight
      )

      /**
       * Next, we consider how clipping affects the position by checking if the
       * tooltip is clipped on the bottom and on the right.
       */
      const isBottomClipped =
        bottom - containerBox.top >= containerBox.height - tooltipHeight

      const isRightClipped =
        left - containerBox.left >= containerBox.width - tooltipWidth

      /**
       * Here, we're only going to consider edge case (2) and (3) because (1) is
       * already handled by clamping the x value to the CoS bounds.
       */
      if (isBottomClipped) {
        /**
         * If clipped on the bottom and on the right, place the tooltip on the LEFT
         * of the connection element. Otherwise, put it on the RIGHT.
         */
        if (isRightClipped) {
          x = x - tooltipWidth
        } else {
          x = x + width
          y = Math.min(top - containerBox.top, containerBox.height - tooltipHeight)
        }
      }

      tooltip.style.transform = `translate(${x}px, ${y}px)`
    },
    toggle(communityId) {
      if (this.activeCommunity === communityId) {
        this.activeCommunity = ""
      } else if (this.isClickable(communityId)) {
        this.activeCommunity = communityId
      }
    },
    updateClickables() {
      const clickableCommunities = Object.keys(this.communities).reduce(
        (clickables, id) => {
          clickables[id] = this.isClickable(id)
          return clickables
        },
        {}
      )
      console.log(clickableCommunities)
      if (Helpers.isDifferent(this.clickables, clickableCommunities)) {
        this.clickables = clickableCommunities
      }
    },
    // A community is only clickable if it's overflowing (i.e. there's more
    // connections than what's visible)
    isClickable(communityId) {
      // Destructure because community is part of a v-for loop
      const [communityElement] = this.$refs[`${communityId}-list`]
      if (
        ["east", "west"].some(
          orientation => communityElement.dataset.orientation === orientation
        )
      ) {
        return communityElement.scrollWidth > communityElement.clientWidth
      }
      if (
        ["north", "south"].some(
          orientation => communityElement.dataset.orientation === orientation
        )
      ) {
        return communityElement.scrollHeight > communityElement.clientHeight
      }
      return false
    },
    getPosition(index, communitySize) {
      // Map the community index to where it should go on the grid
      const positions = [
        {
          column: 2,
          row: 1,
        },
        {
          column: -2,
          row: communitySize > 7 && communitySize < 10 ? 2 : 3,
        },
        {
          column: 2,
          columnEnd: communitySize === 5 ? "span 2" : "initial",
          row: 4,
        },
        {
          column: 1,
          row: communitySize > 6 && communitySize < 9 ? 2 : 3,
        },
        {
          column: 3,
          row: 1,
        },
        {
          column: 3,
          row: 4,
        },
        {
          column: 1,
          row: communitySize > 8 ? -3 : 4,
        },
        {
          column: -2,
          row: communitySize > 9 ? -3 : 4,
        },
        {
          column: 1,
          row: 1,
        },
        {
          column: -2,
          row: 1,
        },
      ]
      const { column, columnEnd, row } = positions[index] || {}
      return {
        column,
        columnEnd,
        row,
        orientation: this.getOrientation(column, row),
      }
    },
    getOrientation(column, row) {
      if (column === 1) {
        return "east"
      }
      if (column === -2) {
        return "west"
      }
      if (row === 1) {
        return "south"
      }
      if (row === 4) {
        return "north"
      }
    },
    isOdd(number) {
      return number % 2 !== 0
    },
  },
}
</script>

<style scoped lang="scss">
ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.community-area {
  --size: clamp(10rem, 20vw, 14rem);
  display: grid;
  grid-template-columns: var(--cols);
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 1rem;
  height: 100%;
  width: 100%;
}

.community-wrapper {
  --row-end: span 2;
  --border-offset: 3rem;

  grid-column-start: var(--column-start);
  grid-column-end: var(--column-end);
  grid-row-start: var(--row);
  grid-row-end: var(--row-end);
  position: relative;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;

  --border-radius: 9999px;

  &.active {
    z-index: 20;
  }

  &.north {
    --row-end: span 3;
    margin-top: var(--border-offset);
    flex-direction: column;
    align-items: center;

    &.active {
      --row: 1 !important;
      --row-end: -1;

      .community {
        height: auto;
      }

      .toggle {
        transform: translateX(-50%);
      }
    }
  }

  &.east {
    justify-self: stretch;
    padding: 0;
    flex-direction: row-reverse;

    &.active {
      --column-end: -2;

      .community {
        width: auto;
      }

      .toggle {
        transform: translateY(-50%) rotate(90deg);
      }
    }
  }

  &.south {
    --row-end: span 3;
    margin-bottom: var(--border-offset);
    flex-direction: column-reverse;
    align-items: center;

    &.active {
      --row-end: -1;

      .community {
        height: auto;
      }

      .toggle {
        transform: translateX(-50%) rotate(180deg);
      }
    }
  }

  &.west {
    justify-self: stretch;

    &.active {
      --column-start: 2 !important;
      --column-end: -1;

      .community {
        width: auto;
      }

      .toggle {
        transform: translateY(-50%) rotate(-90deg);
      }
    }
  }
}

.community {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  background: var(--color, var(--cos-color-secondary));
  position: relative;
  pointer-events: all;

  --border-radius: 9999px;

  &.north,
  &.south {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    max-width: 14rem;
  }

  &.east,
  &.west {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  &.north {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    padding-top: var(--border-offset);

    .toggle {
      top: 0;
      left: 50%;
      transform: translateX(-50%) rotate(180deg);
    }

    .community-icon {
      top: 0.5rem;
      right: 0.5rem;
    }
  }

  &.east {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    padding-right: 4rem;

    .toggle {
      top: 50%;
      right: 0;
      transform: translateY(-50%) rotate(-90deg);
    }

    .community-icon {
      top: 0.5rem;
      right: 0.5rem;
    }
  }

  &.south {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    padding-bottom: var(--border-offset);

    .toggle {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .community-icon {
      bottom: 0.5rem;
      right: 0.5rem;
    }
  }

  &.west {
    border-bottom-left-radius: var(--border-radius);
    border-top-left-radius: var(--border-radius);
    padding-left: 4rem;

    .toggle {
      top: 50%;
      left: 0;
      transform: translateY(-50%) rotate(90deg);
    }

    .community-icon {
      top: 0.5rem;
      left: 0.5rem;
    }
  }
}

.connection-list {
  width: 100%;
  height: 100%;
  overflow: hidden;

  &.north,
  &.south {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  // For the horizontal communities, we're forced to use grid because flex-column
  // doesn't wrap correctly in all major browsers (yeah, I was surprised too :()
  // https://stackoverflow.com/questions/33891709/when-flexbox-items-wrap-in-column-mode-container-does-not-grow-its-width
  &.east,
  &.west {
    display: grid;
    align-items: center;
    grid-template-rows: repeat(2, 1fr);
    grid-auto-columns: min-content;
    grid-auto-flow: column;

    &.odd > :last-child {
      grid-row-end: span 2;
    }
  }

  &.north {
    flex-wrap: wrap;
    padding-bottom: 0.5rem;
  }

  &.east {
    // Reverse the direction of column placement so it places from right to left.
    direction: rtl;
    padding-left: 0.5rem;
  }

  &.west {
    padding-right: 0.5rem;
  }

  &.south {
    flex-wrap: wrap-reverse;
    padding-top: 0.5rem;
  }
}

.connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.5rem;
  width: 5.5rem;
  position: relative;
  padding: 0;
  margin: 0;
  background: none;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  p {
    padding: 0.25rem;
    border: 1px solid black;
    text-transform: uppercase;
    color: black;
    cursor: default;
    font-size: 0.7em;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  h1 {
    cursor: default;
  }
}

.connection-tooltip {
  position: absolute;
  min-width: 10rem;
  border: var(--cos-border);
  border-radius: 1.5rem;
  padding: 1rem 0.5rem;
  display: flex;
  background: white;
  z-index: 20;
  opacity: 0;
  pointer-events: none;

  &.active {
    opacity: 1;
    pointer-events: all;
  }

  button {
    color: inherit;
    background: none;
    padding: 0;
    margin: 0;
    font-size: 1.5em;

    &:last-child {
      margin-top: 1rem;
    }
  }

  .info {
    flex: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 0.5rem;

    p {
      padding: 0.25rem;
      border: 1px solid black;
      text-transform: uppercase;
      color: black;
      cursor: default;
      font-size: 0.7em;
      margin: 0;
    }

    h1 {
      font-size: 4em;
    }
  }

  .controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--cos-color-secondary);
  }

  .community-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    justify-content: center;
    column-gap: 4px;

    li {
      height: 1rem;
      width: 1rem;
      border-radius: 50%;
      background-color: var(--community-color);
    }
  }
}

.toggle {
  position: absolute;
  background: none;
  font-size: 1.5rem;
}

.community-icon {
  position: absolute;
  font-size: 2.5rem;
  z-index: 10;
  background: none;
  padding: 0;
  margin: 0;
  color: inherit;
}

.community-tooltip {
  position: absolute;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--cos-color-secondary);
  background: white;
  padding: 0.2rem 1rem;
  z-index: 20;

  p {
    margin: 0;
  }

  h1 {
    font-size: 1em;
    padding: 0;
    margin: 0;
    color: inherit;
    text-transform: uppercase;
  }

  button {
    background: none;
    padding: 0;
    color: var(--cos-color-secondary);
  }
}
</style>
