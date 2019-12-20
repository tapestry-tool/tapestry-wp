import BootstrapVue from "bootstrap-vue"
import Vue from "vue"
import App from "./App.vue"
import store from "./store"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(BootstrapVue)

const app = new Vue({
  el: "#tapestry-container",
  store,
  render: h => h(App),
})

// expose app to allow testing of Vuex store
if (window.Cypress) {
  window.app = app
}
