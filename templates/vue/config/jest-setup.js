import "@testing-library/jest-dom"
import { configure } from "@testing-library/vue"
import Vue from "vue"
import BootstrapVue from "bootstrap-vue"

Vue.use(BootstrapVue)

jest.mock("@/services/wp")

configure({
  testIdAttribute: "data-qa",
})
