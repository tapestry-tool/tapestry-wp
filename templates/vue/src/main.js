import BootstrapVue from "bootstrap-vue"
import Vue from "vue"
import Vuex from "vuex"
import App from "./App.vue"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(BootstrapVue)
Vue.use(Vuex)

new Vue({
  el: "#tapestry-container",
  render: h => h(App),
})
