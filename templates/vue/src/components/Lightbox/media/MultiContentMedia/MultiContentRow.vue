<template>
  <b-col
    :id="`row-${row.node.id}`"
    :key="row.node.id"
    ref="rowRefs"
    class="col multi-content-row-wrapper"
    cols="12"
    :lg="row.node.typeData.halfWidth ? 6 : 12"
  >
    <div v-if="presentationStyle === 'accordion'" class="button-row">
      <button class="trigger-row-btn" :disabled="disabled" @click="toggle">
        <i v-if="!disabled" :class="isVisible ? 'fas fa-minus' : 'fas fa-plus'"></i>
        <i v-else class="fas fa-lock fa-sm title-row-ico"></i>
        {{ row.node.title }}
        <locked-content
          v-if="disabled"
          :node="row.node"
          :condition-node="conditionNode"
        ></locked-content>
      </button>
      <a v-if="canEditNode" @click="editNode">
        <i class="fas fa-pencil-alt fa-sm pr-2"></i>
      </a>
      <a
        v-if="!disabled"
        class="favourite-btn"
        :class="{ 'is-favourite': isFavourite(row.node.id) }"
        @click="toggleFavourite(row.node.id)"
      >
        <i class="fas fa-heart fa-sm"></i>
      </a>
    </div>
    <div v-if="isVisible" class="multi-content-row">
      <div v-if="presentationStyle === 'accordion'" class="title-row-icon">
        <i v-if="disabled" class="fas fa-lock fa-sm"></i>
        <span v-else>
          <a>
            <i
              v-if="canEditNode"
              class="fas fa-pencil-alt fa-sm pr-2"
              @click="editNode"
            ></i>
          </a>
          <a
            class="favourite-btn"
            :class="{ 'is-favourite': isFavourite(row.node.id) }"
          >
            <i class="fas fa-heart fa-sm" @click="toggleFavourite(row.node.id)"></i>
          </a>
        </span>
      </div>
      <div v-if="disabled" class="row-content">
        <h1 class="title">
          {{ row.node.title }}
        </h1>
        <locked-content
          :node="row.node"
          :condition-node="index > 0 ? rows[index - 1].node : {}"
        ></locked-content>
      </div>
      <div v-else :data-qa="`row-content-${row.node.id}`" class="row-content">
        <div v-if="row.node.mediaType !== 'multi-content'">
          <tapestry-media
            :node-id="row.node.id"
            :dimensions="dimensions"
            context="multi-content"
            style="margin-bottom: 24px;"
            @complete="updateProgress"
            @load="handleLoad($refs.rowRefs[index])"
          />
          <multi-content-rows
            v-if="row.children.length > 0"
            :dimensions="dimensions"
            :node="row.node"
            context="multi-content"
            :level="level + 1"
            @load="handleLoad"
            @updateProgress="updateProgress"
          />
        </div>
        <multi-content-media
          v-else-if="row.children.length > 0"
          :node="getNode(row.node.id)"
          context="multi-content"
          :level="level + 1"
          @close="handleAutoClose"
          @complete="updateProgress"
        />
      </div>
    </div>
  </b-col>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"
import TapestryMedia from "../TapestryMedia"
import LockedContent from "./common/LockedContent"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"

export default {
  name: "multi-content-row",
  components: {
    TapestryMedia,
    MultiContentMedia: () => import("../MultiContentMedia"),
    MultiContentRows: () => import("./MultiContentRows"),
    LockedContent,
  },

  props: {
    row: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
      required: true,
    },
    presentationStyle: {
      type: String, // one of Accordion or Page
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    conditionNode: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    dimensions: {
      type: Object,
      required: true,
    },
    context: {
      type: String,
      required: false,
      default: "",
    },
    level: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      isVisible: true,
    }
  },
  computed: {
    ...mapGetters(["isFavourite", "getNode"]),
    ...mapState(["favourites"]),
    canEditNode() {
      return Helpers.hasPermission(this.row.node, "edit")
    },
  },
  watch: {
    node() {
      this.$nextTick(() => {
        this.$root.$emit("observe-rows", this.$refs.rowRefs)
      })
    },
  },
  mounted() {
    this.isVisible = this.presentationStyle === "page"
    this.$root.$emit("observe-rows", this.$refs.rowRefs)
  },
  methods: {
    ...mapActions(["toggleFavourite"]),
    ...mapMutations(["setReturnRoute"]),
    toggle() {
      this.isVisible = !this.isVisible
    },
    editNode() {
      this.setReturnRoute(this.$route)
      this.$router.push({
        name: names.MULTICONTENTMODAL,
        params: {
          nodeId: this.parent.id,
          type: "edit",
          rowId: this.row.node.id,
          tab: "content",
        },
      })
    },
    updateProgress() {
      this.$emit("updateProgress", this.row.node.id)
    },
    handleLoad(el) {
      this.$emit("load", el)
    },
    handleAutoClose() {
      this.$emit("close")
    },
  },
}
</script>

<style lang="scss" scoped>
.multi-content-row-wrapper {
  background: var(--bg-color-layered);
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-row {
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;
  border-radius: 4px;
  background: var(--bg-color-layered);

  i {
    margin-right: 8px;
  }

  a {
    cursor: pointer;
  }
}

.multi-content-row {
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 8px;

  .title-row-icon {
    position: absolute;
    right: 12px;
    text-align: right;
    a {
      text-decoration: none !important;
    }
  }

  i {
    cursor: pointer;
    color: var(--text-color-primary);
    opacity: 0.25;
  }
  a:hover,
  a:active {
    i {
      opacity: 1;
    }
  }

  .trigger-row-btn {
    background: none;
    color: var(--text-color-primary);
    width: 100%;
    text-align: left;
    i {
      opacity: 1;
    }
  }

  .favourite-btn {
    &.is-favourite > i {
      color: red;
      opacity: 1;
    }
  }
}
</style>
