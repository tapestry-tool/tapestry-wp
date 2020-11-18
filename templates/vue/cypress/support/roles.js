const credentials = {
  admin: {
    username: Cypress.env("ADMIN_USERNAME"),
    password: Cypress.env("ADMIN_PASSWORD"),
  },
  subscriber: {
    username: Cypress.env("SUBSCRIBER_USERNAME"),
    password: Cypress.env("SUBSCRIBER_PASSWORD"),
  },
}

export default credentials

export const roles = Object.fromEntries(
  Object.keys(credentials)
    .map(role => [role.toUpperCase(), role])
    .concat([["PUBLIC", "public"]])
)
