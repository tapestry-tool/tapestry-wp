describe("Answers", () => {
  it("should be able to create an Answer Node and display the correct answers", () => {
    cy.fixture("question.json").as("question")
    cy.setup("@question")

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
      cy.getByTestId(`activity-combobox`).within(() => {
        cy.getByTestId(`choose-activity-node`).click()
        cy.contains(/Question/i).should("be.visible")
        cy.contains(/Question/i).click()
      })
      cy.getByTestId(`question-select`).within(() => {
        cy.getByTestId(`choose-question`).click()
        cy.contains(/What is the meaning of life?/i).should("be.visible")
        cy.contains(/How many birds does it take to change a lightbulb?/i).should(
          "be.visible"
        )
        cy.contains(/What is the meaning of life?/i).click()
      })

      cy.getByTestId("follow-up-text").type("Your past answer: ")
      cy.getByTestId("submit-node-modal").click()
      cy.wait("@addNode")

      cy.getNodeByTitle("Question Node").then(question => {
        cy.openLightbox(question.id).within(() => {
          cy.get("input").type("To live.")
          cy.contains(/submit/i).click()
          cy.getByTestId("close-lightbox").click()
        })
      })

      cy.pause()

      cy.getNodeByTitle(answerNode.title).then(answer => {
        cy.openLightbox(answer.id).within(() => {
          cy.contains(answerNode.title).should("exist")
          cy.contains(`What is the meaning of life?`).should("be.visible")
          cy.contains("Your past answer: ").should("be.visible")
          cy.contains("To live.").should("be.visible")
        })
      })

      cy.getByTestId("close-lightbox").click()
    })
    cy.lightbox().should("not.exist")
  })
})
