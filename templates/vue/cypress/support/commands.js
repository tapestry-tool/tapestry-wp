import "@4tw/cypress-drag-drop"
import { getMediaButton, API_URL } from "./utils"
import roles from "./roles"

Cypress.Commands.add("login", role => {
  const { username, password } = roles[role]
  cy.request("POST", `${API_URL}/login`, { username, password })
})

Cypress.Commands.add("logout", () => {
  // force true is used because cypress does not have a way to
  // simulate hover events.
  cy.request(`${API_URL}/logout`)
})

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
