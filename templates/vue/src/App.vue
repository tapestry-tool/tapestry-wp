<template>
  <loading v-if="loading" data-qa="tapestry-loading" style="height: 75vh;"></loading>
  <div v-else id="app">
    <tapestry-app></tapestry-app>
    <router-view></router-view>
    <node-modal></node-modal>
    <link-modal></link-modal>
    <lightbox v-if="viewingNode" :node-id="nodeId"></lightbox>
    <sidebar v-if="!isEmpty"></sidebar>
    <tapestry-error></tapestry-error>
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
import { mapState, mapMutations, mapGetters } from "vuex"
import { names } from "@/config/routes"
import Lightbox from "@/components/Lightbox"
import LinkModal from "@/components/modals/LinkModal"
import NodeModal from "@/components/modals/NodeModal"
import TapestryApp from "@/components/TapestryApp"
import Sidebar from "@/components/Sidebar"
import TapestryError from "@/components/TapestryError"
import Loading from "@/components/common/Loading"
import client from "@/services/TapestryAPI"
import { isLoggedIn } from "./services/wp"
import "@/assets/styles/themes.css"

export default {
  name: "app",
  components: {
    Loading,
    Lightbox,
    NodeModal,
    LinkModal,
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
    ...mapState(["nodes"]),
    ...mapGetters(["getTheme"]),
    isEmpty() {
      return Object.keys(this.nodes).length === 0
    },
    nodeId() {
      return this.$route.params.nodeId
    },
    viewingNode() {
      return (
        this.$route.name === names.LIGHTBOX || this.$route.query.from === "lightbox"
      )
    },
  },
  watch: {
    loggedIn(isStillLoggedIn) {
      if (!isStillLoggedIn) {
        this.$bvModal.show("loggedOutModal")
      }
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

    const data = [
      client.getTapestry(),
      client.getLastSelectedNode(),
      client.getTheme(),
      client.getAvatar(),
      client.cos.getActivity(),
    ]
    Promise.all(data).then(
      ([tapestryData, selectedNode, theme, savedAvatar, savedCos]) => {
        this.changeTheme(theme.data)
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

        this.init(tapestryData)
        this.addAvatar(savedAvatar)
        this.addCos(savedCos)
        this.loading = false
        if (!this.$route.params.nodeId && tapestryData.nodes.length > 0) {
          let path = `/nodes/${tapestryData.rootId}`
          if (selectedNode) {
            path = `/nodes/${selectedNode.nodeId}`
            if (selectedNode.rowId) {
              path = `${path}/view/${selectedNode.rowId}`
            }
          }
          this.$router.replace({
            path,
            query: this.$route.query,
          })
        }
      }
    )
  },
  beforeDestroy() {
    window.removeEventListener("click", this.recordAnalytics)
  },
  methods: {
    ...mapMutations(["init", "changeTheme", "addAvatar", "addCos"]),
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
  },
}
</script>

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

  #app {
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

    button:focus {
      outline: none;
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
}
</style>
