import { setup } from "../support/utils"

describe("Node Appearance", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    setup("@oneNode")
  })

  it(`
    Given: A Tapestry node
    When: Its appearance is changed using the modal
    Then: It should reflect the changes
  `, () => {
    cy.getSelectedNode().then(node => {
      cy.getByTestId(`edit-node-${node.id}`).click()
      cy.contains(/appearance/i).click()

      cy.contains(/node title/i).click()
      cy.contains(/media button/i).click()
      cy.contains(/progress bar/i).click()

      cy.contains(/thumbnail/i).click()

      const url =
        "https://image.shutterstock.com/z/stock-photo-colorful-flower-on-dark-tropical-foliage-nature-background-721703848.jpg"

      cy.getByTestId(`node-appearance-thumbnail-url`).type(url)
      cy.submitModal()

      cy.getNodeById(node.id).within(() => {
        cy.get("image").should("have.attr", "href", url)
        cy.getByTestId(`node-title-${node.id}`).should("not.exist")
        cy.getByTestId(`node-progress-${node.id}`).should("not.exist")
        cy.getByTestId(`open-node-${node.id}`).should("not.exist")
      })
    })
  })
})
