import {
  getMediaButton,
  API_URL,
  getStore,
  openAddNodeModal,
  submitModal,
  getNode,
  openRootNodeModal,
  openEditNodeModal,
  TEST_TAPESTRY_NAME,
  findNode,
  applyModalChanges,
} from "./utils"
import roles from "./roles"

const COMMAND_DELAY = Cypress.env("DELAY") || 500

if (COMMAND_DELAY > 0) {
  for (const command of [
    "visit",
    "click",
    "trigger",
    "type",
    "clear",
    "reload",
    "contains",
  ]) {
    Cypress.Commands.overwrite(command, (originalFn, ...args) => {
      const origVal = originalFn(...args)
  
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(origVal)
        }, COMMAND_DELAY)
      })
    })
  }
}

Cypress.Commands.add("login", role => {
  const { username, password } = roles[role]
  cy.request("POST", `${API_URL}/login`, { username, password })
})

Cypress.Commands.add("logout", () => cy.request(`${API_URL}/logout`))

Cypress.Commands.add("openLightbox", { prevSubject: "optional" }, (node, id) => {
  cy.scrollTo(0, 0)
  const nodeId = id || node.id
  getMediaButton(nodeId).click({ force: true })
  return cy.get("#lightbox")
})

Cypress.Commands.add("addTapestry", (body = {}) => {
  return cy.request({
    url: `${API_URL}/tapestries`,
    body: { title: TEST_TAPESTRY_NAME, ...body },
    method: "POST",
  })
})

Cypress.Commands.add("deleteTapestry", () => {
  return cy.request({
    url: `${API_URL}/tapestries`,
    body: { title: TEST_TAPESTRY_NAME },
    method: "DELETE",
  })
})

Cypress.Commands.add("visitTapestry", () => {
  cy.visit(`/tapestry/${TEST_TAPESTRY_NAME}`)
  cy.contains(/loading/i, { timeout: 60000 }).should("not.exist")
})

Cypress.Commands.add("getNodeByIndex", idx => getStore().its(`state.nodes.${idx}`))

Cypress.Commands.add("addNode", { prevSubject: "optional" }, (parent, newNode) => {
  if (!newNode) {
    return parent ? openAddNodeModal(parent.id) : openRootNodeModal()
  }

  cy.server()
  cy.route("POST", `${API_URL}/tapestries/**/nodes`).as("postNode")

  if (parent) {
    openAddNodeModal(parent.id)
  } else {
    openRootNodeModal()
  }
  applyModalChanges(newNode)
  submitModal()

  return cy
    .wait("@postNode")
    .its("response.body.id")
    .then(id => findNode(node => node.id === id))
})

Cypress.Commands.add("editNode", { prevSubject: true }, (node, newNode) => {
  if (!newNode) {
    return openEditNodeModal(node.id)
  }

  cy.server()
  cy.route("PUT", `${API_URL}/tapestries/**/nodes/**`).as("editNode")
  cy.route("PUT", `${API_URL}/tapestries/**/nodes/**/permissions`).as(
    "editPermissions"
  )

  openEditNodeModal(node.id)
  applyModalChanges(newNode)
  submitModal()

  cy.wait("@editPermissions")
  cy.wait("@editNode")
  return findNode(nd => nd.id === node.id)
})

Cypress.Commands.add("deleteNode", { prevSubject: true }, node => {
  cy.server()
  cy.route("DELETE", `${API_URL}/tapestries/**/nodes/**`).as("deleteNode")
  cy.route("GET", `${API_URL}/tapestries/**`).as("getTapestry")

  openEditNodeModal(node.id)
  cy.contains(/delete/i).click({ force: true })
  cy.wait("@deleteNode")
  cy.wait("@getTapestry")

  return cy.wrap(node.id)
})

Cypress.Commands.add("getDOMNodeByIndex", index =>
  cy
    .getNodeByIndex(index)
    .its("id")
    .then(getNode)
)

Cypress.Commands.add("findNode", pred => {
  return cy
    .store()
    .its("nodes")
    .then(nodes => nodes.find(pred))
})

Cypress.Commands.add("store", () => getStore().its("state"))
