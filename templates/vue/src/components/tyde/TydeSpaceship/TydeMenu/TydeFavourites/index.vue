<template>
  <div ref="container">
    <headless-accordion :rows="rows" :default-index="-1">
      <template v-slot="{ isVisible, toggle }">
        <div class="favourites">
          <div
            v-for="nodeOrGroup in favouriteNodes"
            :key="nodeOrGroup.id || nodeOrGroup.title"
          >
            <tyde-favourites-row
              v-if="nodeOrGroup.id"
              :node="nodeOrGroup"
              :dimensions="dimensions"
              :visible="isVisible(nodeOrGroup)"
              @toggle="toggle(nodeOrGroup)"
              @unfavourite="handleUnfavourite(nodeOrGroup.id)"
            />
            <div v-else>
              <h4 class="group-title">{{ nodeOrGroup.title }}</h4>
              <div class="group-rows">
                <tyde-favourites-row
                  v-for="node in nodeOrGroup.rows"
                  :key="node.id"
                  :node="node"
                  :dimensions="dimensions"
                  :visible="isVisible(node)"
                  @toggle="toggle(node)"
                  @unfavourite="handleUnfavourite(node.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </headless-accordion>
    <div v-if="showUnfavouriteDialog" class="unfavourite-dialog">
      Are you sure you want to remove {{ focusedNode.title }} from your favourites?
      <div>
        <b-button @click="handleCancel">
          Cancel
        </b-button>
        <b-button @click="handleConfirm">
          Yes
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import HeadlessAccordion from "@/components/common/HeadlessAccordion"
import TydeFavouritesRow from "./TydeFavouritesRow"
import Helpers from "@/utils/Helpers"

export default {
  name: "tyde-favourites",
  components: {
    HeadlessAccordion,
    TydeFavouritesRow,
  },
  props: {
    favourites: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isMounted: false,
      showUnfavouriteDialog: false,
      focusedNode: null,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    favouriteNodes() {
      return this.favourites.map(idOrObject => {
        if (typeof idOrObject === "object") {
          return {
            ...idOrObject,
            rows: idOrObject.rows.map(this.getNode),
          }
        }
        return this.getNode(idOrObject)
      })
    },
    rows() {
      return this.favouriteNodes.flatMap(
        nodeOrObject => nodeOrObject.rows || [nodeOrObject]
      )
    },
    dimensions() {
      if (!this.isMounted) {
        return {}
      }
      const { width } = this.$refs.container.getBoundingClientRect()
      return {
        width,
        height: Helpers.getBrowserHeight(),
      }
    },
  },
  mounted() {
    this.isMounted = true
  },
  methods: {
    ...mapActions(["toggleFavourite"]),
    handleCancel() {
      this.showUnfavouriteDialog = false
      this.focusedNode = null
    },
    async handleConfirm() {
      await this.toggleFavourite(this.focusedNode.id)
      this.showUnfavouriteDialog = false
    },
    handleUnfavourite(id) {
      this.focusedNode = this.getNode(id)
      this.showUnfavouriteDialog = true
    },
  },
}
</script>

<style lang="scss" scoped>
.favourites {
  > * {
    margin-bottom: 1em;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .group-title {
    margin-top: 1em;
    margin-bottom: 1em;
  }

  .group-rows {
    > * {
      margin-bottom: 1em;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.unfavourite-dialog {
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tapestry-light-gray);
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  > div {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  .btn {
    background: var(--tapestry-med-gray);
    border: none;
    margin-right: 8px;
    width: 75px;

    &:last-child {
      background: var(--tapestry-light-blue);
      margin-right: 0;
    }
  }
}
</style>
