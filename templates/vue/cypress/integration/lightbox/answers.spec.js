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
      cy.getByTestId(`activity-combobox`).within(() => {
        cy.getByTestId(`choose-activity-node`).click()
        cy.contains(/Questions/i).should("be.visible")
        cy.contains(/Questions/i).click()
      })

      cy.get(`[class="modal-body p-0"]`).as("scrollbar")

      cy.getByTestId(`question-select`).within(() => {
        cy.getByTestId(`choose-question`).click()
        cy.get("@scrollbar").scrollTo("bottom")
        cy.contains(/How many pidgeons does it take to change a lightbulb?/i).should(
          "be.visible"
        )
        cy.contains(/What is the meaning of life?/i).should("be.visible")
        cy.contains(/How many pidgeons does it take to change a lightbulb?/i).click()
      })

      cy.getByTestId("follow-up-text").type("Your past answer: ")
      cy.getByTestId("submit-node-modal").click()
      cy.wait("@addNode")

      cy.getNodeByTitle(answerNode.title).then(answer => {
        cy.openLightbox(answer.id).within(() => {
          cy.contains(answerNode.title).should("exist")
          cy.contains(
            `How many pidgeons does it take to change a lightbulb?`
          ).should("be.visible")
          cy.contains(`Your past answer: `).should("be.visible")
          cy.contains(`34`).should("be.visible")
        })
      })

      cy.getByTestId("close-lightbox").click()
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
              cy.get("h3").should($h3 => {
                expect($h3).to.contain("What is the meaning of life?")
              })

              cy.get("h4").should($h4 => {
                expect($h4).to.have.length(1)
                expect($h4.first()).to.contain("Previously, you said:")
              })
              cy.contains(`34`).should("be.visible")
            })
          })
        })
    })
})
