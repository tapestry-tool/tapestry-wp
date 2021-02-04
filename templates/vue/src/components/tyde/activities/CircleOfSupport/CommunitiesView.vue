<template>
  <ul class="community-area" :style="{ '--cols': columns }">
    <li
      v-for="community in communityList"
      :key="community.id"
      :class="['community', community.orientation]"
      :style="{
        '--color': community.color,
        '--column': community.column,
        '--row': community.row,
      }"
    >
      {{ community.icon }}
    </li>
  </ul>
</template>

<script>
const Columns = {
  Small: 3,
  Large: 4,
}

export default {
  props: {
    communities: {
      type: Object,
      required: true,
    },
  },
  computed: {
    communityList() {
      const communities = Object.values(this.communities)
      return communities.map((community, index) => ({
        ...community,
        ...this.getCommunityPosition(index, communities.length),
      }))
    },
    columns() {
      const { length } = Object.keys(this.communities)
      if (length <= 4) {
        return Columns.Small
      }
      return Columns.Large
    },
  },
  methods: {
    getCommunityPosition(communityIndex, communityCount) {
      const positions = [
        [2, 1],
        [-2, 2],
        [communityCount === 5 ? `2 / span 2` : 2, -2],
        [1, 2],
        [3, 1],
        [3, -2],
        [1, 1],
        [-2, 1],
        [1, -2],
        [-2, -2],
      ]
      const [column, row] = positions[communityIndex]
      return { column, row, orientation: this.getOrientation(column, row) }
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
      if (row === -2) {
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
}

.community-area {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 1rem;
}

.community {
  background: var(--color, var(--cos-color-secondary));
  grid-column: var(--column);
  grid-row: var(--row);

  --border-radius: 9999px;
  --size: 12rem;

  &.north {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    width: var(--size);
    justify-self: center;
  }

  &.east {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    height: var(--size);
    align-self: center;
  }

  &.south {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    width: var(--size);
    justify-self: center;
  }

  &.west {
    border-bottom-left-radius: var(--border-radius);
    border-top-left-radius: var(--border-radius);
    height: var(--size);
    align-self: center;
  }
}
</style>
