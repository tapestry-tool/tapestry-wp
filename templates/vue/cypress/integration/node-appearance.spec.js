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

      cy.contains(/hide title/i).click()
      cy.contains(/hide media button/i).click()
      cy.contains(/hide progress bar/i).click()
      cy.contains(/background image/i).click()

      cy.intercept("POST", "**/async-upload.php").as("upload")

      cy.getByTestId("import-file-input").attachFile("reddit.png")
      cy.wait("@upload")
        .then(({ response }) => {
          return JSON.parse(response.body).data.url
        })
        .then(() => {
          cy.get("No image").should("not.exist")
          cy.get(".alert-success").should("exist")
          cy.submitModal()

          cy.getNodeById(node.id).within(() => {
            cy.getByTestId(`node-title-${node.id}`).should("not.exist")
            cy.getByTestId(`node-progress-${node.id}`).should("not.exist")
            cy.getByTestId(`open-node-${node.id}`).should("not.exist")
            // cy.get("circle").should("have.attr", "fill")
            cy.getByTestId("nodeImage").should("have.attr", "href")
          })
        })
    })
  })

  it("should be able to edit a node's appearance using the node modal's Color Picker Component", () => {
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

      cy.contains(/Background Color/i)
        .getByTestId(`node-backgroundcolor-${node.id}`)
        .click()
        .click()
      cy.contains(/Text Color/i)
        .getByTestId(`node-textcolor-${node.id}`)
        .click()
        .click()
      cy.getByTestId(`node-backgroundcolor-${node.id}`)
        .find(".swatch")
        .click()
        .find(`[aria-label="#1FBC9C"]`)
        .click()
      cy.getByTestId(`node-textcolor-${node.id}`)
        .find(".swatch")
        .click()
        .find(`[aria-label="#E84B3C"]`)
        .click()

      cy.submitModal()

      cy.getNodeById(node.id).within(() => {
        cy.get(".meta").should("have.css", "color", "rgb(232, 75, 60)")
        // rgb(232, 75, 60) is same as #E84B3C
      })
      cy.getByTestId(`node-circle-${node.id}`)
        .invoke("attr", "fill")
        .should("match", /#1FBC9C/i)
    })
  })
})
