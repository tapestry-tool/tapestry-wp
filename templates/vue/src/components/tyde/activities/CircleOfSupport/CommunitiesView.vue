<template>
  <ul class="community-area">
    <li
      v-for="(group, index) in communityGroups"
      :key="index"
      class="group"
      :style="{
        '--column': group.column,
        '--row': group.row,
      }"
    >
      <ul :class="group.orientation">
        <li
          v-for="community in group.communities"
          :key="community.id"
          :class="['community', group.orientation]"
          :style="{
            '--color': community.color,
          }"
        >
          {{ community.icon }}
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
  },
  computed: {
    /**
     * Group the communities together by where they're going to be placed.
     * The grid is split into four sections:
     *
     * --------------
     *    |__0__|
     *  3 |_____|  1
     *    |  2  |
     * --------------
     *
     * Each community is added to a section in a circular motion as they are
     * created. For example, the first five communities will be added in the
     * following order: 0 -> 1 -> 2 -> 3 -> 0. All following communities, with the
     * exception of the last two, will be added in the same cycle.
     *
     * The last two communities are added to group 3 and 1 respectively, resulting
     * in 3 communities in groups 3 and 1 and 2 communities in groups 0 and 2.
     */
    communityGroups() {
      const NUM_GROUPS = 4
      const MAX_COMMUNITIES = 10

      const groups = Array.from({ length: NUM_GROUPS })
        .fill(-1)
        .map(this.getGroupPosition)

      Object.values(this.communities).forEach((community, index) => {
        let groupNumber = index % NUM_GROUPS
        if (index >= MAX_COMMUNITIES - 2) {
          const lookup = {
            [MAX_COMMUNITIES - 2]: 3,
            [MAX_COMMUNITIES - 1]: 1,
          }
          groupNumber = lookup[index]
        }
        groups[groupNumber].communities.push(community)
      })

      return groups
    },
  },
  methods: {
    getGroupPosition(_, index) {
      const positions = [
        [2, 1],
        [-2, `1 / span 3`],
        [2, -2],
        [1, `1 / span 3`],
      ]
      const [column, row] = positions[index]
      return {
        column,
        row,
        orientation: this.getOrientation(column, row),
        communities: [],
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
  list-style: none;
}

.community-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 1rem;
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
  background: var(--color, var(--cos-color-secondary));

  --border-radius: 9999px;
  --size: 12rem;

  &.north {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    width: var(--size);
  }

  &.east {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    height: var(--size);
  }

  &.south {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    width: var(--size);
  }

  &.west {
    border-bottom-left-radius: var(--border-radius);
    border-top-left-radius: var(--border-radius);
    height: var(--size);
  }
}
</style>
