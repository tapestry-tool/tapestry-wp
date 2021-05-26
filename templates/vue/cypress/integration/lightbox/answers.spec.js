describe("Answers", () => {
  it("should be able to create an Answer Node and display the correct answers", () => {
    cy.fixture("answers.json").as("answers")
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
      cy.getByTestId(`choose-activity-node`).click()
      cy.pause()
      // select Activity Node
      cy.getByTestId(`choose-question`).click()
      // select Question
      cy.getByTestId("follow-up-text").type("Your past answer: ")
      cy.getByTestId("submit-node-modal").click()
      cy.openLightbox(answerNode.id)

      cy.contains(answerNode.title).should("exist")
      cy.getByTestId(`answer-display`).within(() => {
        cy.contains(`What is the meaning to life?`).should("be.visible")
        cy.contains(`Your past answer: `).should("be.visible")
      })
      cy.contains(/done/i).click()
    })
    cy.lightbox().should("not.exist")
  }),
    it("should be able to display answers with AnswerMedia", () => {
      cy.fixture("answers.json").as("answers")
      cy.setup("@answers")
      cy.store()
        .its("state.nodes")
        .then(nodes => {
          const sampleAnswer = Object.values(nodes)[1]
          cy.openLightbox(sampleAnswer.id).within(() => {
            cy.contains(sampleAnswer.title).should("exist")
            cy.getByTestId(`answer-display`).within(() => {
              cy.pause()
              cy.get("h3").should($h3 => {
                expect($h3).to.contain("What is the meaning of life?")
              })
              cy.get("h4").should($h4 => {
                expect($h4).to.have.length(1)
                expect($h4.first()).to.contain("Previously, you said:")
              })
              cy.get("div.tapestry-activity").should($activity => {
                expect($activity).to.have.length(2)
              })
            })
          })
        })
    })
})
