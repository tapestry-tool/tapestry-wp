<template>
  <div ref="container">
    <div
      v-for="(row, index) in rows"
      ref="rowRefs"
      :key="row.id"
      class="sub-page-row"
    >
      <div class="title-row">
        <a class="title-row-icon">
          <i
            v-if="isFavourite(row.id)"
            class="fas fa-heart fa-sm"
            style="color:red; cursor:pointer;"
            @click="toggleFavourite(row.id)"
          ></i>
          <i
            v-else
            class="fas fa-heart fa-sm"
            style="color:white; cursor:pointer;"
            @click="toggleFavourite(row.id)"
          ></i>
        </a>
      </div>
      <tapestry-media
        :node-id="row.id"
        :dimensions="dimensions"
        context="page"
        :autoplay="false"
        @complete="completeNode(row.id)"
        @load="handleLoad(index)"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import TapestryMedia from "../TapestryMedia"
import { names } from "@/config/routes"

export default {
  name: "sub-page",
  components: {
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
        if (rowId) {
          this.$router.push({
            name: names.SUBMULTICONTENT,
            params: { nodeId, rowId, subRowId },
            query: this.$route.query,
          })
        } else {
          // Nested multi-content routing
          this.$router.push({
            name: names.SUBMULTICONTENT,
            params: { nodeId, rowId: this.nodeId, subRowId },
            query: this.$route.query,
          })
        }
      } else {
        this.$router.push({
          name: names.MULTICONTENT,
          params: { nodeId, rowId },
          query: this.$route.query,
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.title-row {
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;
  border-radius: 4px;
}

.title-row-icon {
  flex: 1;
  text-align: right;
}

.button-row-trigger {
  background: none;
  width: 100%;
  text-align: left;
}

.sub-page-row {
  background: rgb(30, 30, 30);
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 8px;
  color: white;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
