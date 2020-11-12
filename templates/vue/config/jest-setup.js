import "@testing-library/jest-dom"
import Vue from "vue"
import BootstrapVue from "bootstrap-vue"
import VueYouTubeEmbed from "vue-youtube-embed"

/**
 * JSDom, the "fake" DOM used by the Jest tests, doesn't have a script tag
 * which is necessary for VueYoutubeEmbed to work correctly.
 */
document.body.appendChild(document.createElement("script"))

Vue.use(VueYouTubeEmbed)
Vue.use(BootstrapVue)

jest.mock("@/services/wp")
