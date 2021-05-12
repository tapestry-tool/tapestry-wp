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

          cy.getNodeById(node.id).within(() => {
            cy.getByTestId(`node-title-${node.id}`).should("not.exist")
            cy.getByTestId(`node-progress-${node.id}`).should("not.exist")
            cy.getByTestId(`open-node-${node.id}`).should("not.exist")
            cy.get("#nodeCircle").should("have.attr", "fill")  
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
      
      cy.contains(/Background Color/i).get("#textColorID").click().click()
      cy.contains(/Text Color/i).get("#backgroundColorID").click().click()
      cy.get("#backgroundColorID").click().find(`[aria-label="#1FBC9C"]`).click()
      cy.get("#textColorID").click().find(`[aria-label="#E84B3C"]`).click()

      cy.submitModal()
      
      cy.getNodeById(node.id).within(() => {
            cy.get('.meta').should('have.css', 'color', 'rgb(232, 75, 60)')
            // rgb(232, 75, 60) is same as #E84B3C
            cy.get("#nodeCircle").should('have.attr', 'fill', '#1FBC9C') 
          })
       //cy.getByTestId(`node-circle-${node.id}`).should("have.attr", "fill", "#1FBC9C")    
          
    })
  })
})
