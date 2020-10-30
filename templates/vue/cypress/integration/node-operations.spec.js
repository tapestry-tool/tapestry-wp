import { setup } from "../support/utils"

describe("Node Operations", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    setup("@oneNode")
  })

  it(`
    Given: A Tapestry node and its author
    When: The tapestry loads
    Then: Its add, edit, and media buttons should be visible
  `)

  it(`
    Given: A Tapestry node
    When: Its media button is clicked
    Then: Its lightbox should be visible
  `)

  it(`
    Given: A Tapestry node and its author
    When: Its add button is clicked
    Then: The add node modal should be visible
  `)

  it(`
    Given: A Tapestry node and its author
    When: Its edit button is clicked
    Then: The edit node modal should be visible
  `)

  it(`
    Given: A Tapestry node that does not have a media button
    When: The node is clicked
    Then: Its lightbox should be visible
  `, () => {
    const newNode = {
      hideMedia: true,
    }
    cy.getSelectedNode().then(node => {
      cy.wrap(node).editNodeInStore(newNode)
      cy.getByTestId(`node-${node.id}`).click()
    })
    cy.get("#lightbox").should("exist")
  })
})
