describe("Answers", () => {
  it("should be able to create an Answer Node and display the correct answers", () => {
    cy.fixture("answer.json").as("answers")
    cy.setup("@answers")

    const answerNode = {
      title: "Answer Node",
      mediaType: "answer",
    }

    cy.server()
    cy.route("POST", `**/nodes`).as("addNode")
    cy.route("PUT", `**/nodes/**`).as("editNode")

    cy.getSelectedNode().then(node => {
      cy.getByTestId(`add-node-${node.id}`).click()
      cy.getByTestId(`node-title`).type(answerNode.title)
      cy.getByTestId(`node-media-type`).select(answerNode.mediaType)
      cy.getByTestId(`question-combobox`).within(() => {
        cy.getByTestId(`choose-question-node`).click()
        cy.contains(/What is the meaning of life?/i).should("be.visible")
        cy.contains(/How many pigeons does it take to change a lightbulb?/i).should(
          "be.visible"
        )
        cy.contains(/How many pigeons does it take to change a lightbulb?/i).click()
      })

      cy.getByTestId("follow-up-text").type("Your past answer: ")
      cy.getByTestId("submit-node-modal").click()
      cy.wait("@addNode")

      cy.getNodeByTitle(answerNode.title).then(answer => {
        cy.openLightbox(answer.id).within(() => {
          cy.contains(answerNode.title).should("exist")
          cy.contains(`How many pigeons does it take to change a lightbulb?`).should(
            "be.visible"
          )
          cy.contains("Your past answer: ").should("be.visible")
          cy.contains("51").should("be.visible")
        })
      })

      cy.getByTestId("close-lightbox").click()
    })
    cy.lightbox().should("not.exist")
  })
})
