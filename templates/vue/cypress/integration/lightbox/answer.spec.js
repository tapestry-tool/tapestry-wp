describe("Answers", () => {
  it("should be able to create an Answer Node and display the correct answers", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.intercept("POST", `**/nodes`).as("addNode")
    cy.intercept("PUT", `**/nodes/**`).as("editNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("Activity")
      const question = `What's your name?`
      const placeholder = "placeholder"
      const answer = "Tapestry"
      cy.getByTestId("question-text-0").click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-text-0").click({ force: true })
      cy.getByTestId("question-answer-text-single-0").click({ force: true })
      cy.getByTestId("question-answer-text-single-placeholder-0").type(placeholder)
      cy.getByTestId("submit-node-modal").click()
      cy.wait("@editNode")
      cy.openLightbox(node.id)
      cy.intercept("POST", "**/users/activity?**").as("submit")
      cy.lightbox().within(() => {
        cy.get(`[placeholder="${placeholder}"]`).should("be.visible")
        cy.get("input").type(answer)
        cy.contains(/submit/i).click()
        cy.wait("@submit")
        cy.contains("You can press the button below to continue.").should(
          "be.visible"
        )
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })

    cy.getSelectedNode().then(node => {
      cy.openModal("add", node.id)
      cy.getByTestId(`node-title`).type("Answer Node")
      cy.getByTestId(`node-media-type`).select("Answer")
      cy.getByTestId(`activity-combobox`).within(() => {
        cy.getByTestId(`choose-activity-node`).click()
        cy.contains(/root/i).should("be.visible")
        cy.contains(/root/i).click()
      })
      cy.getByTestId(`question-select`).within(() => {
        cy.getByTestId(`choose-question`).click()
        cy.contains(/What's your name?/i).should("be.visible")
        cy.contains(/What's your name?/i).click()
      })
      cy.getByTestId("follow-up-text").type("Name: ")
      cy.getByTestId("submit-node-modal").click()
      cy.wait("@addNode")
    })

    cy.getNodeByTitle("Answer Node").then(answer => {
      cy.getNodeById(answer.id).click()
      cy.openLightbox(answer.id).within(() => {
        cy.contains("Name: ").should("be.visible")
        cy.contains("Tapestry").should("be.visible")
      })
    })
    cy.getByTestId("close-lightbox").click()
    cy.lightbox().should("not.exist")
  })
})
