import "cypress-file-upload"
import { applyModalChanges } from "./utils"
import roles from "./roles"
import Helpers from "../../src/utils/Helpers"

const API_URL = `/wp-json/tapestry-tool/v1`

const TEST_TAPESTRY_NAME = `cypress`

Cypress.Commands.add("setup", { prevSubject: false }, (fixture, role) => {
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

Cypress.Commands.add("openLightbox", { prevSubject: "optional" }, (node, id) => {
  cy.scrollTo(0, 0)
  const nodeId = id || node.id
  cy.getByTestId(`open-node-${nodeId}`).click({ force: true })
  return cy.get("#lightbox")
})

Cypress.Commands.add("addTapestry", (body = {}) => {
  return cy.request({
    url: `${API_URL}/tapestries`,
    body: { title: TEST_TAPESTRY_NAME, ...body },
    method: "POST",
  })
})

Cypress.Commands.add("deleteTestTapestry", () => {
  return cy.request({
    url: `${API_URL}/tapestries`,
    body: { title: TEST_TAPESTRY_NAME },
    method: "DELETE",
  })
})

Cypress.Commands.add("visitTapestry", () => {
  cy.visit(`/tapestry/${TEST_TAPESTRY_NAME}`)
  cy.contains(/loading/i).should("not.exist")
})

Cypress.Commands.add("getNodeByTitle", title =>
  cy.findNode(node => node.title === title)
)

Cypress.Commands.add("getSelectedNode", () =>
  cy
    .store()
    .its("state")
    .then(({ nodes, selectedNodeId }) => nodes[selectedNodeId])
)

Cypress.Commands.add("addNode", (node, parent) => {
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
        cy.addLink(parent, id)
      }
    })
  })
})

Cypress.Commands.add("addLink", (source, target) => {
  cy.server()
  cy.route("POST", "**/links").as("postLink")
  cy.store()
    .its("dispatch")
    .then(dispatch => dispatch("addLink", { source, target }))
  cy.wait("@postLink")
})

Cypress.Commands.add(
  "addNodeInModal",
  { prevSubject: "optional" },
  (parent, newNode) => {
    if (!newNode) {
      cy.getByTestId(`add-node-${parent.id}`).click({ force: true })
      return
    }

    cy.server()
    cy.route("POST", "**/nodes").as("postNode")

    if (parent) {
      cy.getByTestId(`add-node-${parent.id}`).click({ force: true })
    } else {
      cy.getByTestId(`root-node-button`).click({ force: true })
    }
    applyModalChanges(newNode)
    cy.contains("Submit").click({ force: true })

    return cy
      .wait("@postNode")
      .its("response.body.id")
      .then(id => cy.findNode(node => node.id === id))
  }
)

Cypress.Commands.add("editNode", { prevSubject: true }, (node, newNode) => {
  if (!newNode) {
    cy.getByTestId(`edit-node-${node.id}`).click({ force: true })
    return
  }

  cy.server()
  cy.route("PUT", `**/nodes/**`).as("editNode")
  cy.route("PUT", `**/nodes/**/permissions`).as("editPermissions")

  cy.getByTestId(`edit-node-${node.id}`).click({ force: true })
  applyModalChanges(newNode)
  cy.contains("Submit").click({ force: true })

  cy.wait("@editPermissions")
  cy.wait("@editNode")
  return cy.findNode(nd => nd.id === node.id)
})

Cypress.Commands.add("submitModal", () => {
  cy.server()
  cy.route("PUT", `**/nodes/**/permissions`).as("editPermissions")

  cy.contains("Submit").click()
  cy.wait("@editPermissions")
})

Cypress.Commands.add("editNodeInStore", { prevSubject: true }, (node, newNode) => {
  cy.server()
  cy.route("PUT", `**/nodes/**`).as("editNode")

  cy.store().then(store => store.dispatch("updateNode", { id: node.id, newNode }))

  cy.wait("@editNode")
})

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

Cypress.Commands.add("store", () => cy.window().its("app.$store"))

Cypress.Commands.add("getByTestId", testId => cy.get(`[data-qa="${testId}"]`))

Cypress.Commands.add("getNodeById", id => cy.getByTestId(`node-${id}`))

Cypress.Commands.add("getEditable", testId =>
  cy.getByTestId(testId).find("[contenteditable=true]")
)
