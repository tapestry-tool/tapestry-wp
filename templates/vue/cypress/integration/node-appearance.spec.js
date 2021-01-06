describe("Node Appearance", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to edit a node's appearance using the node modal", () => {
    // Check initial settings for render images
    cy.store()
      .its("state.settings")
      .then(
        settings =>
          expect(!settings.hasOwnProperty("renderImages") || settings.renderImages)
            .to.be.true
      )

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.contains(/appearance/i).click()

      cy.contains(/node title/i).click()
      cy.contains(/media button/i).click()
      cy.contains(/progress bar/i).click()

      cy.contains(/add a thumbnail/i).click()

      cy.server()
      cy.route("POST", "**/async-upload.php").as("upload")

      cy.getByTestId("import-file-input").attachFile("reddit.png")
      cy.wait("@upload")
        .its("response.body.data.url")
        .then(() => {
          cy.get("No image").should("not.exist")
          cy.get(".alert-success").should("exist")
          cy.submitModal()

          cy.get(".toolbar").scrollIntoView()
          cy.reload()

          cy.getNodeById(node.id).within(() => {
            cy.store()
              .its("state.nodes")
              .then(nodes => {
                const [node] = Object.values(nodes)
                expect(node.imageURL).match(/reddit/)
              })

            cy.getByTestId(`node-title-${node.id}`).should("not.exist")
            cy.getByTestId(`node-progress-${node.id}`).should("not.exist")
            cy.getByTestId(`open-node-${node.id}`).should("not.exist")
            cy.get("circle")
              .should("have.attr", "fill")
              .and("match", /url/)
            cy.getByTestId("nodeImage")
              .should("have.attr", "href")
              .and("match", /reddit/)
          })
        })
    })
  })
})
