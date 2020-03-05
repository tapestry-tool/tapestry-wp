// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import { getMediaButton, API_URL } from "./utils"
import roles from "./roles"

Cypress.Commands.add("login", role => {
  const { username, password } = roles[role]
  cy.request("POST", `${API_URL}/login`, { username, password })
})

Cypress.Commands.add("logout", () => {
  // force true is used because cypress does not have a way to
  // simulate hover events.
  cy.get("#wp-admin-bar-logout > a").click({ force: true })
})

Cypress.Commands.add("openLightbox", id => {
  getMediaButton(id).click()
  return cy.get("#lightbox")
})

Cypress.Commands.add("deleteTapestry", name => {
  cy.contains("Tapestries").click()
  cy.get("td")
    .contains(name)
    .click()
  cy.contains(/move to trash/i).click()
})
