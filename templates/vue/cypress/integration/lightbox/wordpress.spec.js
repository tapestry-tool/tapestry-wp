describe("Wordpress", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to add a wp post node", () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("wp-post")

      cy.server()
      cy.route("GET", /posts/i).as("getPosts")

      cy.getByTestId("wp-combobox").click()
      cy.wait("@getPosts")

      cy.getByTestId("node-modal").within(() => {
        cy.contains(/hello world/i).click()
      })

      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.contains(/hello world/i).should("be.visible")
      })
    })
  })
})
