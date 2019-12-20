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

import { getTapestryUrl, SITE_URL } from "./utils"
import roles from "./roles"

Cypress.Commands.add("login", role => {
  const user = roles[role]
  cy.visit(`${SITE_URL}/wp-admin/`)

  cy.wait(100)
  cy.get("#user_login").type(user.username)

  cy.wait(100)
  cy.get("#user_pass").type(user.password)

  cy.get("#wp-submit").click()
})

Cypress.Commands.add("logout", () => {
  cy.visit(`${SITE_URL}/wp-admin/`)

  // force true is used because cypress does not have a way to
  // simulate hover events.
  cy.get("#wp-admin-bar-logout > a").click({ force: true })
})
