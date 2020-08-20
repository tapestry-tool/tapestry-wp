export default {
  admin: {
    username: Cypress.env("ADMIN_USERNAME"),
    password: Cypress.env("ADMIN_PASSWORD"),
  },
  subscriber: {
    username: Cypress.env("SUBSCRIBER_USERNAME"),
    password: Cypress.env("SUBSCRIBER_PASSWORD"),
  },
}
