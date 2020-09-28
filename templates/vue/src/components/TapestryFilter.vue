<template>
  <div class="filter">
    <button v-if="canSearch" @click="toggleFilter">
      <i class="fas fa-search"></i>
    </button>
    <div :class="['input-container', { 'input-container-show': isActive }]">
      <combobox
        v-model="filterOption"
        class="filter-combobox"
        :options="comboboxFilterOptions"
        :input-style="inputStyles"
        size="sm"
      >
        <template v-slot="slotProps">
          <p class="filter-value">
            {{ slotProps.option }}
          </p>
        </template>
      </combobox>
      <combobox
        v-model="filterValue"
        class="filter-combobox"
        item-text="name"
        item-value="id"
        :options="comboboxValueOptions"
        :input-style="inputStyles"
        size="sm"
      >
        <template v-slot="slotProps">
          <p class="filter-value">
            <code v-if="shouldRenderCount(slotProps.option)">
              {{ slotProps.option.count }}
            </code>

            {{ slotProps.option.name }}
          </p>
        </template>
      </combobox>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex"
import Combobox from "./Combobox"
import client from "../services/TapestryAPI"
import { nodeStatuses } from "@/utils/constants.js"

const filterOptions = {
  AUTHOR: "author",
  STATUS: "status",
}

export default {
  name: "tapestry-filter",
  components: {
    Combobox,
  },
  data() {
    return {
      allContributors: null,
      isActive: false,
      filterOption: "",
      filterValue: "",
      allStatuses: null,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    canSearch() {
      return wpData.wpCanEditTapestry === "1"
    },
    inputStyles() {
      return {
        borderRadius: "4px",
        width: "60%",
      }
    },

    isFilterSelected() {
      return this.filterOption !== ""
    },
    comboboxFilterOptions() {
      return Object.values(filterOptions)
    },
    comboboxValueOptions() {
      switch (this.filterOption) {
        case filterOptions.AUTHOR: {
          return this.allContributors !== null
            ? Object.values(this.allContributors)
            : [
                ...new Map(
                  Object.values(this.nodes).map(node => [
                    node.author.id,
                    node.author,
                  ])
                ).values(),
              ].forEach(el => {
                el.disable = false
              })
        }
        case filterOptions.STATUS: {
          let res = []
          for (let status of this.allStatuses) {
            let obj = {}
            obj["count"] = status[1]
            obj["name"] = status[0]
            obj["id"] = status[0]
            if (status[1] == 0) {
              obj["disable"] = true
            } else {
              obj["disable"] = false
            }
            res.push(obj)
          }
          return res
        }
        default:
          return []
      }
    },
  },
  watch: {
    async filterValue(next) {
      await this.refetchTapestryData(Number(next))
      this.updateVisibleNodes(this.getVisibleNodes())
    },
    isActive(isActive) {
      if (isActive) {
        this.updateVisibleNodes([])
      } else {
        this.updateVisibleNodes(Object.keys(this.nodes).map(id => parseInt(id, 10)))
      }
    },
  },
  async created() {
    if (wpData.wpCanEditTapestry === "1") {
      this.allContributors = await client.getAllContributors()
    }
    this.allStatuses = new Map()
    for (let status of nodeStatuses) {
      this.allStatuses.set(status, 0)
    }
    for (let node of Object.values(this.nodes)) {
      this.allStatuses.set(node.status, this.allStatuses.get(node.status) + 1)
    }
  },
  methods: {
    ...mapMutations(["updateVisibleNodes"]),
    ...mapActions(["refetchTapestryData"]),
    toggleFilter() {
      if (this.isActive) {
        this.filterOption = ""
        this.filterValue = ""
      }
      this.isActive = !this.isActive
    },
    shouldRenderCount(option) {
      return typeof option.count == "number"
    },
    getVisibleNodes() {
      if (this.isActive && this.filterOption && this.filterValue) {
        switch (this.filterOption) {
          case filterOptions.AUTHOR: {
            return Object.values(this.nodes)
              .filter(node => node.author.id == this.filterValue)
              .map(node => node.id)
          }
          case filterOptions.STATUS: {
            return Object.values(this.nodes)
              .filter(node => node.status == this.filterValue)
              .map(node => node.id)
          }
          default:
            break
        }
      }
      return Object.keys(this.nodes).map(id => parseInt(id, 10))
    },
  },
}
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  height: 32px;

  button {
    color: #999;
    padding: 0;
    margin-right: 12px;
    background: #fbfbfb;
    box-shadow: 0 0 7px 0 #ddd;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 0.8em;
    transform: translateY(-4px);

    &:hover {
      color: #11a6d8;
    }
  }

  .filter-combobox {
    margin-right: 8px;
    &:last-child {
      transform: translateX(-40%);
    }
  }
}

.input-container {
  display: flex;
  opacity: 0;
  transform: translateX(-32px);
  transition: all 0.4s ease-in;
  pointer-events: none;

  &-show {
    opacity: 1;
    transform: translateX(0);
    pointer-events: all;
  }
}
</style>
