<template>
  <loading v-if="loading" data-qa="tapestry-loading" style="height: 75vh;"></loading>
  <div v-else id="app">
    <tapestry-app></tapestry-app>
    <router-view name="lightbox"></router-view>
    <node-modal></node-modal>
    <tapestry-sidebar v-if="!isEmpty"></tapestry-sidebar>
    <tapestry-error></tapestry-error>
    <b-modal :visible="!loggedIn" id="loggedOutModal">
      You can either refresh and stay logged out or log in again. <br />
      <b-button @click="refresh">Refresh</b-button>
      <b-button @click="redirectToLogin">Log In</b-button>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import NodeModal from "./components/NodeModal"
import TapestryApp from "./components/TapestryApp"
import TapestrySidebar from "./components/TapestrySidebar"
import Loading from "./components/Loading"
import client from "./services/TapestryAPI"
import TapestryError from "./components/TapestryError"
import $ from "jquery";

export default {
  name: "app",
  components: {
    Loading,
    NodeModal,
    TapestryApp,
    TapestrySidebar,
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
    isEmpty() {
      return Object.keys(this.nodes).length === 0
    },
  },
  watch: {
    loggedIn: function (newValue) {
      if (!newValue) this.$bvModal.show("loggedOutModal")
    }
  },
  mounted() {
var that = this
jQuery( function($) {
  wp.heartbeat.interval( 'fast' );

  $(document).on('heartbeat-tick', function(event,data) {
    that.loggedIn = data["wp-auth-check"]
    console.log(that.loggedIn)
  });
});



    window.addEventListener("click", this.recordAnalytics)
    const data = [client.getTapestry(), client.getUserProgress()]
    Promise.all(data).then(([dataset, progress]) => {
      this.init({ dataset, progress })
      this.loading = false
      if (!this.$route.params.nodeId && dataset.nodes.length > 0) {
        this.$router.replace({
          path: `/nodes/${dataset.rootId}`,
          query: this.$route.query,
        })
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener("click", this.recordAnalytics)
  },
  methods: {
    ...mapMutations(["init"]),
    refresh() {
      this.$router.go()
    },
    redirectToLogin() {
      
    },
    recordAnalytics(evt) {
      const x = evt.clientX + window.scrollLeft
      const y = evt.clientY + window.scrollTop
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

  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    h1,
    h2,
    h3,
    h4,
    h5 {
      &::before {
        display: none;
      }
    }

    p {
      padding: 0;
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
