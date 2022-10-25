<template>
  <loading v-if="loading" data-qa="tapestry-loading" style="height: 75vh;"></loading>
  <div v-else id="app">
    <tapestry-app :aria-hidden="viewingNode ? 'true' : 'false'"></tapestry-app>
    <router-view></router-view>
    <node-modal></node-modal>
    <node-modals></node-modals>
    <lightbox
      v-if="node"
      :visible="viewingNode"
      :node-id="nodeId"
      aria-hidden="false"
    ></lightbox>
    <sidebar v-if="!isEmptyTapestry"></sidebar>
    <tapestry-error></tapestry-error>
    <div
      v-show="fullscreenDropzone.active"
      class="fullscreen-dropzone"
      @dragleave="hideFullscreenDropzone"
      @dragover="handleDragover"
      @drop="handleDrop"
    ></div>
    <b-modal
      id="loggedOutModal"
      :visible="!loggedIn"
      title="Not Logged In"
      no-close-on-backdrop
    >
      You can either refresh and stay logged out or log in again.
      <template #modal-footer>
        <b-button @click="refresh">Refresh</b-button>
        <b-button @click="redirectToLogin">Log In</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions, mapState } from "vuex"
import { names } from "@/config/routes"
import Lightbox from "@/components/Lightbox"
import NodeModal from "@/components/modals/NodeModal"
import NodeModals from "@/components/modals/NodeModals"
import TapestryApp from "@/components/TapestryApp"
import Sidebar from "@/components/Sidebar"
import TapestryError from "@/components/TapestryError"
import Loading from "@/components/common/Loading"
import client from "@/services/TapestryAPI"
import { isLoggedIn } from "./services/wp"
import { toolKeyBindings } from "@/utils/constants"
import "@/assets/styles/themes.css"

export default {
  name: "app",
  components: {
    Loading,
    Lightbox,
    NodeModal,
    NodeModals,
    TapestryApp,
    Sidebar,
    TapestryError,
  },
  data() {
    return {
      loading: true,
      loggedIn: true,
    }
  },
  computed: {
    ...mapState(["fullscreenDropzone"]),
    ...mapGetters(["getNode", "isEmptyTapestry", "getTheme", "getInitialNodeId"]),
    nodeId() {
      return this.$route.params.nodeId
    },
    node() {
      return this.getNode(this.nodeId)
    },
    viewingNode() {
      return (
        this.$route.name === names.LIGHTBOX || this.$route.query.from === "lightbox"
      )
    },
    viewingApp() {
      return this.$route.name === names.APP
    },
  },
  watch: {
    loggedIn(isStillLoggedIn) {
      if (!isStillLoggedIn) {
        this.$bvModal.show("loggedOutModal")
      }
    },
    getTheme() {
      this.applyTheme()
    },
  },
  mounted() {
    if (isLoggedIn()) {
      var that = this
      jQuery(function($) {
        wp.heartbeat.interval("fast")

        $(document).on("heartbeat-tick", function(event, data) {
          that.loggedIn = data["wp-auth-check"]
        })
      })
    }

    window.addEventListener("click", this.recordAnalytics)
    window.addEventListener("keydown", this.handleKeydown)
    window.addEventListener("resize", this.updateBrowserDimensions)
    this.updateBrowserDimensions()

    const data = [
      client.getTapestry(),
      client.getLastSelectedNode(),
      client.getTheme(),
    ]
    Promise.all(data).then(([tapestryData, selectedNode, theme]) => {
      this.changeTheme(theme.data)
      this.applyTheme()

      this.init(tapestryData)
      this.loading = false
      if (!this.$route.params.nodeId && tapestryData.nodes.length > 0) {
        let path = `/nodes/${this.getInitialNodeId}`
        if (selectedNode) {
          path = `/nodes/${selectedNode.nodeId}`
          if (selectedNode.rowId) {
            path = `${path}/view/${selectedNode.rowId}`
          }
        }
        this.$router.push({
          path,
          query: this.$route.query,
        })
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener("click", this.recordAnalytics)
    window.removeEventListener("keydown", this.handleKeydown)
    window.removeEventListener("resize", this.updateBrowserDimensions)
  },
  methods: {
    ...mapActions(["undo", "redo"]),
    ...mapMutations([
      "init",
      "changeTheme",
      "updateBrowserDimensions",
      "setCurrentTool",
      "setFullscreenDropzone",
    ]),
    refresh() {
      this.$router.go()
    },
    redirectToLogin() {
      window.location.href = `${window.location.origin}/wp-login.php?redirect_to=${window.location.href}`
    },
    recordAnalytics(evt) {
      const x = evt.clientX + window.pageXOffset
      const y = evt.clientY + window.pageYOffset
      client.recordAnalyticsEvent("user", "click", "screen", null, {
        x: x,
        y: y,
      })
    },
    applyTheme() {
      if (this.getTheme == "system") {
        const isDarkMode =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        document.documentElement.setAttribute(
          "data-theme",
          isDarkMode ? "dark" : "light"
        )
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", e => {
            document.documentElement.setAttribute(
              "data-theme",
              e.matches ? "dark" : "light"
            )
          })
      } else {
        document.documentElement.setAttribute("data-theme", this.getTheme)
      }
    },
    handleKeydown(evt) {
      // make sure no inputs are in focus (this.viewingApp already prevents capturing inputs in modals, but have to make sure the main app's inputs are not in focus)
      const activeElement = document.activeElement
      if (
        this.viewingApp &&
        activeElement.tagName !== "INPUT" &&
        activeElement.tagName !== "TEXTAREA" &&
        activeElement.className !== "node-title"
      ) {
        if (evt.code === "KeyZ" && (evt.metaKey || evt.ctrlKey)) {
          const action = evt.shiftKey ? this.redo : this.undo
          action().then(message => {
            if (message) {
              this.$bvToast.toast(message, {
                noCloseButton: true,
                autoHideDelay: 3000,
                variant: "secondary",
                solid: true,
                toaster: "b-toaster-bottom-center",
                bodyClass: "tapestry-toast-body",
              })
            }
          })
        } else {
          const tool = Object.entries(toolKeyBindings).find(
            ([, key]) => `Key${key}` === evt.code
          )?.[0]
          if (tool) {
            this.setCurrentTool(tool)
          }
        }
      }
    },
    handleDragover(evt) {
      evt.preventDefault()
    },
    hideFullscreenDropzone() {
      this.setFullscreenDropzone({ active: false, file: null })
    },
    handleDrop(evt) {
      evt.preventDefault()
      evt.stopPropagation()
      this.setFullscreenDropzone({ active: false, file: evt.dataTransfer.files[0] })
    },
  },
}
</script>

<style lang="scss" scoped>
.fullscreen-dropzone {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 9999;
}
</style>

<style lang="scss">
html {
  font-size: 100%;

  body.single-tapestry {
    background: var(--bg-color-primary);
    .site-title a:link,
    .site-title a:visited {
      color: var(--text-color-secondary);
    }
    a:link,
    a:visited {
      color: var(--highlight-color);
    }
  }

  #app,
  #lightbox {
    color: var(--text-color-primary);
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;

    li {
      line-height: initial;
    }

    h1,
    h2,
    h3,
    h4,
    h5 {
      &::before {
        display: none;
      }
    }

    .btn {
      &:disabled,
      &.disabled {
        * {
          opacity: 50%;
        }
      }
    }
  }

  .tapestry-toast-body {
    text-align: center;
    font-weight: bold;
  }
}
</style>
