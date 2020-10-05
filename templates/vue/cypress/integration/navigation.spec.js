import { setup } from "../support/utils"

describe("Navigation", () => {
  beforeEach(() => {
    cy.fixture("user.json").as("nonEmpty")
  })

  it(`
    Given: An empty Tapestry and its author
    When: The Tapestry loads
    Then: The root node button should appear
  `, () => {
    setup()
    cy.getByTestId("root-node-button").should("be.visible")
  })

  it(`
    Given: An empty Tapestry and a public user
    When: The Tapestry loads
    Then: The empty Tapestry text should appear
  `)

  it(`
    Given: A non-empty Tapestry
    When: A node is clicked
    Then: That node should appear larger and the url should be updated
  `)

  it(`
    Given: A non-empty Tapestry and an authorized user
    When: A node is dragged
    Then: That node should move positions on the page
  `)
})
