describe("Node Operations", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to see the add, edit, and media buttons on load", () => {
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

  it("should show the lightbox when the node is clicked if the node doesn't have a media button", () => {
    cy.getSelectedNode().then(node => {
      cy.editNode(node.id, {
        hideMedia: true,
      })
      cy.getNodeById(node.id).click()
      cy.lightbox().should("be.visible")
    })
  })
})
