describe("Node Operations", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it(`
    Given: A Tapestry node and its author
    When: The tapestry loads
    Then: Its add, edit, and media buttons should be visible and clickable
  `, () => {
    cy.getSelectedNode().then(({ id }) => {
      cy.openModal("add", id)
      cy.getByTestId("node-modal").should("be.visible")
      cy.contains(/cancel/i).click()

      cy.openModal("edit", id)
      cy.getByTestId("node-modal").should("be.visible")
      cy.contains(/cancel/i).click()

      cy.openLightbox(id).should("be.visible")
    })
  })

  it(`
    Given: A Tapestry node that does not have a media button
    When: The node is clicked
    Then: Its lightbox should be visible
  `, () => {
    cy.getSelectedNode().then(node => {
      cy.editNode(node.id, {
        hideMedia: true,
      })
      cy.getNodeById(node.id).click()
      cy.lightbox().should("be.visible")
    })
  })
})
