import BootstrapVue from "bootstrap-vue"
import Vue from "vue"
import App from "./App.vue"
import store from "./store"
import router from "./router"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(BootstrapVue)

new Vue({
  el: "#tapestry-container",
  store,
  router,
  render: h => h(App),
})
