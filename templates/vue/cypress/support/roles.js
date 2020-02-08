export default {
  admin: {
    username: Cypress.env("ADMIN_USERNAME"),
    password: Cypress.env("ADMIN_PASSWORD"),
  },
  subscriber: {
    username: Cypress.env("SUBCRIBER_USERNAME"),
    password: Cypress.env("SUBCRIBER_PASSWORD"),
  },
}
