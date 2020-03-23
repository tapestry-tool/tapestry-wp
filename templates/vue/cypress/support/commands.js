import {
  getMediaButton,
  API_URL,
  getStore,
  openAddNodeModal,
  getByTestId,
  submitModal,
  getNode,
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

Cypress.Commands.add("addTapestry", title => {
  cy.login("admin")
  cy.request({
    url: `${API_URL}/tapestries`,
    body: { title },
    method: "POST",
  })
})

Cypress.Commands.add("deleteTapestry", title => {
  cy.login("admin")
  cy.request({
    url: `${API_URL}/tapestries`,
    body: { title },
    method: "DELETE",
  })
})

Cypress.Commands.add("getNodeByIndex", idx => getStore().its(`state.nodes.${idx}`))

Cypress.Commands.add(
  "addChild",
  { prevSubject: true },
  (parent, { mediaType, ...rest }) => {
    cy.server()
    cy.route("POST", `${API_URL}/tapestries/**/nodes`).as("postNode")

    openAddNodeModal(parent.id)
    getByTestId("node-mediaType").select(mediaType)
    Object.entries(rest).forEach(([testId, value]) => {
      getByTestId(`node-${testId}`).type(value)
    })
    submitModal()

    cy.wait("@postNode")
      .its("response.body.id")
      .then(id => getNode(id).should("exist"))
  }
)
