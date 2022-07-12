<template>
  <b-col
    v-if="node.unlocked || !node.hideWhenLocked"
    :class="htmlClass"
    cols="12"
    :lg="node.typeData.halfWidth ? 6 : 12"
  >
    <div class="multi-content-row">
      <div v-if="presentationStyle === 'accordion'" class="button-row">
        <button class="trigger-row-btn" :disabled="disabled" @click="toggle">
          <i
            v-if="!disabled"
            :class="isVisible ? 'fas fa-minus' : 'fas fa-plus'"
          ></i>
          <i v-else class="fas fa-lock fa-sm title-row-icon"></i>
          {{ node.title }}
          <locked-content
            v-if="disabled"
            :node="node"
            :condition-node="conditionNode"
          ></locked-content>
        </button>
        <a v-if="canEditNode" @click="editNode">
          <i class="fas fa-pencil-alt fa-sm pr-2"></i>
        </a>
        <a
          v-if="!disabled"
          class="favourite-btn"
          :class="{ 'is-favourite': isFavourite(node.id) }"
          @click="toggleFavourite(node.id)"
        >
          <i class="fas fa-heart fa-sm"></i>
        </a>
      </div>
      <div v-else class="title-row-icon">
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
            v-if="node.typeData.showTitle !== false"
            class="favourite-btn"
            :class="{ 'is-favourite': isFavourite(node.id) }"
          >
            <i class="fas fa-heart fa-sm" @click="toggleFavourite(node.id)"></i>
          </a>
        </span>
      </div>
      <div v-if="disabled && presentationStyle !== 'accordion'" class="row-content">
        <h1 class="title">
          {{ node.title }}
        </h1>
        <locked-content
          :node="node"
          :condition-node="conditionNode"
        ></locked-content>
      </div>
      <div
        v-if="!disabled && isVisible"
        :data-qa="`row-content-${node.id}`"
        class="row-content"
      >
        <div v-if="node.mediaType !== 'multi-content'">
          <tapestry-media
            :node-id="node.id"
            :dimensions="dimensions"
            context="multi-content"
            :hide-title="presentationStyle === 'accordion'"
            style="margin-bottom: 24px;"
            @complete="complete"
            @load="handleLoad(null)"
          />
          <multi-content-rows
            v-if="children.length > 0"
            :dimensions="dimensions"
            :node="node"
            context="multi-content"
            :level="level + 1"
            @load="handleLoad"
            @complete="complete"
          />
        </div>
        <multi-content-media
          v-else-if="children.length > 0"
          :node="getNode(node.id)"
          context="multi-content"
          :level="level + 1"
          :hide-title="presentationStyle === 'accordion'"
          @load="handleLoad(null)"
          @close="handleAutoClose"
          @complete="complete"
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
    node: {
      type: Object,
      required: true,
    },
    children: {
      type: Array,
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
      isVisible: this.presentationStyle === "page",
    }
  },
  computed: {
    ...mapGetters(["isFavourite", "getNode"]),
    ...mapState(["favourites"]),
    canEditNode() {
      return Helpers.hasPermission(this.node, "edit")
    },
    htmlClass() {
      return [
        "col",
        "multi-content-row-wrapper",
        "presentation-style-" + this.presentationStyle,
        (this.presentationStyle === "page" ? "pr" : "pl") + "-0",
      ]
    },
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
        name: names.MODAL,
        params: {
          nodeId: this.$route.params.nodeId,
          type: "edit",
          rowId: this.node.id,
          tab: "content",
        },
        query: { from: "lightbox" },
      })
    },
    complete() {
      this.$emit("complete", this.node.id)
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

<style lang="scss">
.multi-content-row-wrapper.presentation-style-accordion
  > .multi-content-row
  > .row-content
  > .media-container
  > header {
  display: none;
}
</style>

<style lang="scss" scoped>
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
  background: var(--bg-color-layered);
  border-radius: 4px;
  margin-bottom: 8px;

  .row-content {
    padding: 8px 16px;
  }

  .title-row-icon {
    position: absolute;
    right: 12px;
    top: 8px;
    text-align: right;
    z-index: 100;
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
