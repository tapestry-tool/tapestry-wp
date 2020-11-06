import BootstrapVue from "bootstrap-vue"
import Vue from "vue"
import App from "./App.vue"
import store from "./store"
import router from "./router"
import VueYouTubeEmbed from "vue-youtube-embed"
import vSelect from "vue-select"

import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(VueYouTubeEmbed)
Vue.use(BootstrapVue)
Vue.component("v-select", vSelect)

const app = new Vue({
  el: "#tapestry-container",
  store,
  router,
  render: h => h(App),
})

// expose app to allow testing of Vuex store
if (window.Cypress) {
  window.app = app
}
