import "cypress-file-upload"
import roles from "./roles"
import Helpers from "../../src/utils/Helpers"
import { API_URL, TEST_TAPESTRY_NAME } from "./constants"

Cypress.Commands.add("setup", { prevSubject: false }, (fixture, role = "admin") => {
  if (fixture) {
    cy.get(fixture).then(tapestry => {
      cy.addTapestry(tapestry)
    })
  } else {
    cy.addTapestry()
  }
  if (role !== "public") {
    cy.login(role)
  }
  cy.visitTapestry()
})

Cypress.Commands.add("login", role => {
  const { username, password } = roles[role]
  cy.request("POST", `${API_URL}/login`, { username, password })
})

Cypress.Commands.add("logout", () => cy.request(`${API_URL}/logout`))

Cypress.Commands.add("addTapestry", (body = {}) => {
  return cy.request({
    url: `${API_URL}/tapestries`,
    body: { title: TEST_TAPESTRY_NAME, ...body },
    method: "POST",
  })
})

Cypress.Commands.add("deleteTapestry", (title = TEST_TAPESTRY_NAME) => {
  return cy.request({
    url: `${API_URL}/tapestries`,
    body: { title },
    method: "DELETE",
  })
})

Cypress.Commands.add("visitTapestry", () => {
  cy.visit(`/tapestry/${TEST_TAPESTRY_NAME}`)
  cy.contains(/loading/i).should("not.exist")
})

// -- Nodes --

Cypress.Commands.add("getNodeByTitle", title =>
  cy.findNode(node => node.title === title)
)

Cypress.Commands.add("getSelectedNode", () =>
  cy
    .store()
    .its("state")
    .then(({ nodes, selectedNodeId }) => nodes[selectedNodeId])
)

Cypress.Commands.add("addNode", { prevSubject: false }, (parent, node) => {
  cy.server()
  cy.route("PUT", `**/nodes/**/permissions`).as("editPermissions")
  cy.store().then(store => {
    store.dispatch(
      "addNode",
      Helpers.deepMerge(store.getters.createDefaultNode(), node)
    )
    cy.wait("@editPermissions")
    cy.getNodeByTitle(node.title).then(({ id }) => {
      store.commit("updateVisibleNodes", [...store.state.visibleNodes, id])
      if (parent) {
        cy.addLink(parent.id || parent, id)
      }
    })
  })
})

Cypress.Commands.add("editNode", { prevSubject: false }, (id, newNode) => {
  cy.server()
  cy.route("PUT", `**/nodes/**`).as("editNode")

  cy.store().then(store => store.dispatch("updateNode", { id, newNode }))

  cy.wait("@editNode")
})

Cypress.Commands.add(
  "updateNodeProgress",
  { prevSubject: false },
  (id, progress) => {
    cy.server()
    cy.route("POST", `**/users/progress`).as("saveProgress")

    cy.store().then(store => store.dispatch("updateNodeProgress", { id, progress }))

    cy.wait("@saveProgress")
  }
)

Cypress.Commands.add("deleteNode", () => {
  cy.server()
  cy.route("DELETE", `**/nodes/**`).as("deleteNode")

  cy.contains(/delete/i).click()
  cy.wait("@deleteNode")
})

Cypress.Commands.add("findNode", pred => {
  return cy
    .store()
    .its("state.nodes")
    .then(nodes => Object.values(nodes).find(pred) || null)
})

Cypress.Commands.add("getNodeById", id => cy.getByTestId(`node-${id}`))

// -- Lightbox --

Cypress.Commands.add("lightbox", () => cy.getByTestId("lightbox"))

Cypress.Commands.add("openLightbox", { prevSubject: "optional" }, (node, id) => {
  cy.getByTestId(`open-node-${id || node.id}`).click({ force: true })
  return cy.lightbox()
})

Cypress.Commands.add("closeLightbox", () => cy.getByTestId("close-lightbox").click())

// -- Links --

Cypress.Commands.add("link", (source, target) =>
  cy.getByTestId(`link-${source}-${target}`)
)

Cypress.Commands.add("addLink", (source, target) => {
  cy.server()
  cy.route("POST", "**/links").as("postLink")
  cy.store()
    .its("dispatch")
    .then(dispatch => dispatch("addLink", { source, target }))
  cy.wait("@postLink")
})

// -- Modal --

Cypress.Commands.add("openModal", (type, id) => {
  switch (type) {
    case "add":
      return cy.getByTestId(`add-node-${id}`).click()
    case "edit":
      return cy.getByTestId(`edit-node-${id}`).click()
    case "settings":
      return cy.getByTestId("settings-button").click()
    default:
      throw new Error(`Unknown modal type: ${type}`)
  }
})

Cypress.Commands.add("submitModal", () => {
  cy.server()
  cy.route("PUT", `**/nodes/**/permissions`).as("editPermissions")

  cy.getByTestId("submit-node-modal").click()
  cy.wait("@editPermissions")
})

Cypress.Commands.add("submitSettingsModal", () => {
  cy.server()
  cy.route("PUT", `**/settings`).as("save")

  cy.getByTestId("settings-modal").within(() => {
    cy.getByTestId("submit-button").click()
  })
  cy.wait("@save")
})

Cypress.Commands.add("changeMediaType", type =>
  cy.getByTestId(`node-media-type`).select(type)
)

// -- Utils --

Cypress.Commands.add("store", () => cy.window().its("app.$store"))

Cypress.Commands.add("getByTestId", testId => cy.get(`[data-qa="${testId}"]`))

Cypress.Commands.add("getEditable", testId =>
  cy.getByTestId(testId).find("[contenteditable=true]")
)
