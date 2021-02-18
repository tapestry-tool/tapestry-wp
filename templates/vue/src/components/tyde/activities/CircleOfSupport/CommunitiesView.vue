<template>
  <ul class="community-area" :style="{ '--cols': columns }">
    <li
      v-for="community in communitiesWithPosition"
      :key="community.id"
      :class="[
        'community',
        community.position.orientation,
        { active: community.id === activeCommunity },
      ]"
      :style="{
        '--color': community.color,
        '--column-start': community.position.column,
        '--column-end': community.position.columnEnd,
        '--row': community.position.row,
      }"
      @click="toggle(community.id)"
    >
      <ul>
        <li v-for="connection in community.connections" :key="connection.id">
          {{ connection.avatar }}
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
export default {
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
      activeCommunity: "",
    }
  },
  computed: {
    columns() {
      return Object.values(this.communities).length > 4
        ? `1fr repeat(2, var(--size)) 1fr`
        : `1fr calc(var(--size) * 2) 1fr`
    },
    communitiesWithPosition() {
      return Object.values(this.communities).map(
        (community, index, communities) => ({
          ...community,
          position: this.getPosition(index, communities.length),
          connections: community.connections.map(id => this.connections[id]),
        })
      )
    },
  },
  methods: {
    toggle(communityId) {
      this.activeCommunity = this.activeCommunity === communityId ? "" : communityId
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
          row: -3,
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
          row: -3,
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
      if (row === -3) {
        return "north"
      }
    },
  },
}
</script>

<style scoped lang="scss">
ul {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  list-style: none;
}

.community-area {
  --size: 14rem;
  display: grid;
  grid-template-columns: var(--cols);
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 1rem;
  justify-items: center;
}

.group {
  grid-column: var(--column);
  grid-row: var(--row);

  ul {
    display: flex;
    gap: 1rem;
    justify-content: center;

    &.east,
    &.west {
      flex-direction: column;
    }
  }
}

.community {
  --row-end: span 2;

  background: var(--color, var(--cos-color-secondary));
  grid-column-start: var(--column-start);
  grid-column-end: var(--column-end);
  grid-row-start: var(--row);
  grid-row-end: var(--row-end);
  position: relative;

  --border-radius: 9999px;

  &.active {
    z-index: 10;
  }

  &.north {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    width: var(--size);

    &.active {
      --row: 2 !important;
      --row-end: -1;
    }
  }

  &.east {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    justify-self: stretch;

    &.active {
      --column-end: -2;
    }
  }

  &.south {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    width: var(--size);

    &.active {
      --row-end: -2;
    }
  }

  &.west {
    border-bottom-left-radius: var(--border-radius);
    border-top-left-radius: var(--border-radius);
    justify-self: stretch;

    &.active {
      --column-start: 2 !important;
      --column-end: -1;
    }
  }
}
</style>
