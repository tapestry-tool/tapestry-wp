import "@testing-library/jest-dom"
import Vue from "vue"
import BootstrapVue from "bootstrap-vue"

Vue.use(BootstrapVue)

jest.mock("@/services/wp")
