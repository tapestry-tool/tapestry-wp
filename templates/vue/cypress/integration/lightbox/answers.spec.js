describe("Answers", () => {
  //   it("should be able to create an Answer Node and display the correct answers", () => {
  //     cy.fixture("answers.json").as("answers")
  //     cy.setup("@answers")

  //     const answerNode = {
  //       title: "Answer Node",
  //       mediaType: "answer",
  //     }

  //     cy.server()
  //     cy.route("POST", `**/nodes`).as("addNode")
  //     cy.route("PUT", `**/nodes/**`).as("editNode")

  //     cy.getSelectedNode().then(node => {
  //       cy.getByTestId(`add-node-${node.id}`).click()
  //       cy.getByTestId(`node-title`).type(answerNode.title)
  //       cy.getByTestId(`node-media-type`).select(answerNode.mediaType)
  //       cy.getByTestId(`choose-activity-node`).click()
  //       // select Activity Node
  //       cy.getByTestId(`choose-question`).click()
  //       // select Question
  //       cy.getByTestId("follow-up-text").type("You previously entered: ")
  //       cy.getByTestId("submit-node-modal").click()
  //       cy.openLightbox(answerNode.id)

  //       cy.contains(answerNode.title).should("exist")
  //       cy.getByTestId(`answer-display`).within(() => {
  //         cy.contains(`What is the meaning to life?`).should("be.visible")
  //         cy.contains(`You previously entered: `).should("be.visible")
  //       })

  //       cy.contains(/done/i).click()
  //     })
  //     cy.lightbox().should("not.exist")
  //   }),
  it("should be able to display answers with AnswerMedia", () => {
    cy.fixture("answers.json").as("answers")
    cy.setup("@answers")

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const sampleAnswer = Object.values(nodes)[1]
        const defaultValues = {
          activityID: 7044,
          questionID: "1a34c960-bcc5-4057-9db6-78e8ed6a8552",
          followUpText: "Previously, you said:",
        }
        cy.openModal("edit", sampleAnswer.id)
        cy.getByTestId("choose-activity-node").should(
          "have.value",
          defaultValues.activityID
        )
      })
    cy.log(cy.f)
  })
})
