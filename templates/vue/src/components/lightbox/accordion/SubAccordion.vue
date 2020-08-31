<template>
  <div ref="container">
    <tapestry-accordion
      :rows="rows.map(row => row.id)"
      :value="rowId"
      @input="changeRow"
    >
      <template v-slot="{ isVisible, toggle }">
        <div>
          <div
            v-for="(row, index) in rows"
            ref="rowRefs"
            :key="row.id"
            class="sub-accordion-row"
          >
            <div class="button-row">
              <button class="button-row-trigger" @click="toggle(row.id)">
                <i :class="isVisible(row.id) ? 'fas fa-minus' : 'fas fa-plus'"></i>
                {{ row.title }}
              </button>
              <a @click="toggleFavourite(row.id)">
                <i
                  v-if="isFavourite(row.id)"
                  class="fas fa-heart fa-sm"
                  style="color:red;"
                ></i>
                <i v-else class="fas fa-heart fa-sm" style="color:white;"></i>
              </a>
            </div>
            <tapestry-media
              v-if="isVisible(row.id)"
              :node-id="row.id"
              :dimensions="dimensions"
              :autoplay="false"
              @complete="completeNode(row.id)"
              @close="toggle(row.id)"
              @load="handleLoad(index)"
            />
          </div>
        </div>
      </template>
    </tapestry-accordion>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import TapestryAccordion from "@/components/TapestryAccordion"
import TapestryMedia from "@/components/TapestryMedia"
import { names } from "@/config/routes"

export default {
  name: "sub-accordion",
  components: {
    TapestryAccordion,
    TapestryMedia,
  },
  props: {
    dimensions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    rows: {
      type: Array,
      required: true,
    },
    rowId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["isFavourite"]),
  },
  methods: {
    ...mapActions(["completeNode", "toggleFavourite"]),
    handleLoad(idx) {
      this.$emit("load", this.$refs.rowRefs[idx])
    },
    changeRow(subRowId) {
      const { nodeId, rowId } = this.$route.params
      if (subRowId) {
        this.$router.push({
          name: names.SUBACCORDION,
          params: { nodeId, rowId, subRowId },
        })
      } else {
        this.$router.push({
          name: names.ACCORDION,
          params: { nodeId, rowId },
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.button-row {
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;
  border-radius: 4px;

  i {
    margin-right: 8px;
  }

  a {
    cursor: pointer;
  }
}

.button-row-trigger {
  background: none;
  width: 100%;
  text-align: left;
}

.sub-accordion-row {
  background: rgb(30, 30, 30);
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
