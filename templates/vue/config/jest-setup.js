import "@testing-library/jest-dom"
import Vue from "vue"
import BootstrapVue from "bootstrap-vue"
import vSelect from "vue-select"
import { configure } from "@testing-library/vue"

configure({
  testIdAttribute: "data-qa",
})

Vue.component("v-select", vSelect)
Vue.use(BootstrapVue)

jest.mock("@/services/wp")
