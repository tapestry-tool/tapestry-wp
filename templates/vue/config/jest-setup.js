import "@testing-library/jest-dom"
import { configure } from "@testing-library/vue"
import Vue from "vue"
import BootstrapVue from "bootstrap-vue"
import VueYouTubeEmbed from "vue-youtube-embed"
import vSelect from "vue-select"
import { configure } from "@testing-library/vue"

/**
 * JSDom, the "fake" DOM used by the Jest tests, doesn't have a script tag
 * which is necessary for VueYoutubeEmbed to work correctly.
 */
document.body.appendChild(document.createElement("script"))

configure({
  testIdAttribute: "data-qa",
})

Vue.component("v-select", vSelect)

Vue.use(VueYouTubeEmbed)
Vue.use(BootstrapVue)

jest.mock("@/services/wp")

configure({
  testIdAttribute: "data-qa",
})
