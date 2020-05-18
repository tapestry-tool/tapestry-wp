import {
  getMediaButton,
  API_URL,
  getStore,
  openAddNodeModal,
  getByTestId,
  submitModal,
  getNode,
  SITE_URL,
  openRootNodeModal,
  openEditNodeModal,
} from "./utils"
import roles from "./roles"

Cypress.Commands.add("login", role => {
  const { username, password } = roles[role]
  cy.request("POST", `${API_URL}/login`, { username, password })
})

Cypress.Commands.add("logout", () => cy.request(`${API_URL}/logout`))

Cypress.Commands.add("openLightbox", id => {
  getMediaButton(id).click()
  return cy.get("#lightbox")
})

Cypress.Commands.add("addTapestry", (title, body = {}) => {
  cy.request({
    url: `${API_URL}/tapestries`,
    body: { title, ...body },
    method: "POST",
  })
})

Cypress.Commands.add("deleteTapestry", title => {
  cy.request({
    url: `${API_URL}/tapestries`,
    body: { title },
    method: "DELETE",
  })
})

Cypress.Commands.add("visitTapestry", title => {
  cy.visit(`${SITE_URL}/tapestry/${title}`)
  cy.contains(/loading/i).should("not.exist")
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
  const { mediaType, ...rest } = newNode
  getByTestId("node-mediaType").select(mediaType)
  Object.entries(rest).forEach(([testId, value]) => {
    getByTestId(`node-${testId}`).type(value)
  })
  submitModal()

  return cy
    .wait("@postNode")
    .its("response.body.id")
    .then(id => getNode(id))
})

Cypress.Commands.add("editNode", { prevSubject: true }, (node, newNode) => {
  if (!newNode) {
    return openEditNodeModal(node.id)
  }

  cy.server()
  cy.route("POST", `${API_URL}/tapestries/**/nodes`).as("postNode")

  openEditNodeModal(node.id)
  const { mediaType, ...rest } = newNode
  getByTestId("node-mediaType").select(mediaType)
  Object.entries(rest).forEach(([testId, value]) => {
    getByTestId(`node-${testId}`).type(value)
  })
  submitModal()

  return cy
    .wait("@postNode")
    .its("response.body.id")
    .then(id => getNode(id))
})

Cypress.Commands.add("deleteNode", { prevSubject: true }, node => {
  cy.server()
  cy.route("DELETE", `${API_URL}/tapestries/**/nodes/**`).as("deleteNode")
  cy.route("GET", `${API_URL}/tapestries/**`).as("getTapestry")

  openEditNodeModal(node.id)
  cy.contains(/delete/i).click()
  cy.wait("@deleteNode")
  cy.wait("@getTapestry")

  return cy.wrap(node.id)
})
