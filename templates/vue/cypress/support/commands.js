import "cypress-file-upload"
import "@testing-library/cypress/add-commands"
import roles from "./roles"
import { deepMerge } from "./utils"
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
  cy.getByTestId("tapestry-loading").should("not.exist")
  // Close the minimap if the minimap is visible
  cy.get("body").then($body => {
    const $button = $body.find(`[data-qa="close-minimap"]`)
    if ($button.length > 0) {
      $button.first().trigger("click")
    }
  })
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

Cypress.Commands.add("addNode", { prevSubject: false }, (parentId, node) => {
  cy.intercept("POST", `**/nodes`).as("addNode")
  cy.store().then(store => {
    store.dispatch("addNode", {
      node: deepMerge(store.getters.createDefaultNode(), node),
      parentId,
    })
    cy.wait("@addNode")
  })
})

Cypress.Commands.add("editNode", { prevSubject: false }, (id, newNode) => {
  cy.intercept("PUT", `**/nodes/**`).as("editNode")

  cy.store().then(store => store.dispatch("updateNode", { id, newNode }))

  cy.wait("@editNode")
})

Cypress.Commands.add(
  "updateNodeProgress",
  { prevSubject: false },
  (id, progress) => {
    cy.store().then(store => store.dispatch("updateNodeProgress", { id, progress }))

    cy.store()
      .its("state.nodes")
      .should(nodes => {
        const node = nodes[id]
        expect(node.progress).to.equal(progress)
      })
  }
)

Cypress.Commands.add("deleteNode", () => {
  cy.intercept("DELETE", `**/nodes/**`).as("deleteNode")

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

Cypress.Commands.add("lightbox", () => cy.getByTestId("lightbox-content"))

Cypress.Commands.add("openLightbox", { prevSubject: "optional" }, (node, id) => {
  // force click to avoid overlapping node problems with auto-placing new nodes
  cy.getByTestId(`open-node-${id || node.id}`).click({ force: true })
  return cy.lightbox()
})

Cypress.Commands.add("closeLightbox", ({ skipWaitingForFocus = false } = {}) => {
  cy.getByTestId("close-lightbox").click()
  // ensure focus returns to a node before doing anything else
  if (!skipWaitingForFocus) {
    cy.focused().should("have.class", "node")
  }
})

// -- Links --

Cypress.Commands.add("link", (source, target) =>
  cy.getByTestId(`link-${source}-${target}`)
)

Cypress.Commands.add("addLink", (source, target) => {
  cy.intercept("POST", "**/links").as("postLink")
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
    case "user-answers":
      return cy.getByTestId("user-answers-button").click()
    default:
      throw new Error(`Unknown modal type: ${type}`)
  }
})

Cypress.Commands.add("submitModal", () => {
  cy.getByTestId("submit-node-modal").click()
  cy.getByTestId("node-modal", { timeout: 10000 }).should("not.exist")
})

Cypress.Commands.add("submitSettingsModal", () => {
  cy.intercept("PUT", `**/settings`).as("save")

  cy.getByTestId("settings-modal").within(() => {
    cy.getByTestId("submit-button").click()
  })
  cy.wait("@save")
})

Cypress.Commands.add("changeMediaType", type =>
  cy.getByTestId(`node-media-type`).select(type)
)

Cypress.Commands.add("changeMediaFormat", format =>
  cy.getByTestId(`node-media-format`).select(format)
)

// -- Utils --

Cypress.Commands.add("sidebar", () => cy.getByTestId("sidebar"))

Cypress.Commands.add("app", () => cy.window().its("app"))

Cypress.Commands.add("store", () => cy.window().its("app.$store"))

Cypress.Commands.add("getByTestId", (testId, ...args) =>
  cy.get(`[data-qa="${testId}"]`, ...args)
)

Cypress.Commands.add("getEditable", testId =>
  cy.getByTestId(testId).find("[contenteditable=true]")
)
