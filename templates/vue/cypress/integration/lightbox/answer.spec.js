describe("Answers", () => {
  // it("should be able to create an Answer Node and display the correct answers", () => {
  //   cy.fixture("question.json").as("question")
  //   cy.setup("@question")

  //   const answerNode = {
  //     title: "Answer Node",
  //     mediaType: "answer",
  //   }

  //   cy.server()
  //   cy.route("POST", `**/nodes`).as("addNode")
  //   cy.route("PUT", `**/nodes/**`).as("editNode")

  //   cy.getSelectedNode().then(node => {
  //     cy.getByTestId(`add-node-${node.id}`).click()
  //     cy.getByTestId(`node-title`).type(answerNode.title)
  //     cy.getByTestId(`node-media-type`).select(answerNode.mediaType)
  //     cy.getByTestId(`activity-combobox`).within(() => {
  //       cy.getByTestId(`choose-activity-node`).click()
  //       cy.contains(/Question/i).should("be.visible")
  //       cy.contains(/Question/i).click()
  //     })
  //     cy.getByTestId(`question-select`).within(() => {
  //       cy.getByTestId(`choose-question`).click()
  //       cy.contains(/What is the meaning of life?/i).should("be.visible")
  //       cy.contains(/How many birds does it take to change a lightbulb?/i).should(
  //         "be.visible"
  //       )
  //       cy.contains(/What is the meaning of life?/i).click()
  //     })

  //     cy.getByTestId("follow-up-text").type("Your past answer: ")
  //     cy.getByTestId("submit-node-modal").click()
  // 		cy.pause()
  //     cy.wait("@addNode")

  //     cy.getNodeByTitle("Question Node").then(question => {
  //       cy.openLightbox(question.id).within(() => {
  //         cy.get("input").type("To live.")
  //         cy.contains(/submit/i).click()
  //         cy.getByTestId("close-lightbox").click()
  //       })
  //     })

  //     cy.getNodeByTitle(answerNode.title).then(answer => {
  //       cy.pause()
  //       cy.getNodeById(answer.id).click()
  //       cy.openLightbox(answer.id).within(() => {
  //         cy.contains(answerNode.title).should("exist")
  //         cy.contains("Your past answer: ").should("be.visible")
  //         cy.contains("To live.").should("be.visible")
  //       })
  //     })

  //     cy.getByTestId("close-lightbox").click()
  //   })
  //   cy.lightbox().should("not.exist")
  // })

  it("should be able to create an Answer Node and display the correct answers", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.server()
    cy.route("POST", `**/nodes`).as("addNode")
    cy.route("PUT", `**/nodes/**`).as("editNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("Activity")
      const question = `What's your name?`
      const placeholder = "placeholder"
      const answer = "Tapestry"
      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-text-0").click({ force: true })
      cy.getByTestId("question-answer-text-single-0").click({ force: true })
      cy.getByTestId("question-answer-text-single-placeholder-0").type(placeholder)
      cy.submitModal()
      cy.openLightbox(node.id)
      cy.route("POST", "/users/activity/**").as("submit")
      cy.lightbox().within(() => {
        cy.get(`[placeholder="${placeholder}"]`).should("be.visible")
        cy.get("input").type(answer)
        cy.contains(/submit/i).click()
        cy.contains("Thanks!").should("be.visible")
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
      cy.pause()
      cy.getByTestId(`question-select`).within(() => {
        cy.getByTestId(`choose-question`).click()
        cy.contains(/What's your name?/i).should("be.visible")
        cy.contains(/What's your name?/i).click()
      })
      cy.getByTestId("follow-up-text").type("Name: ")
      cy.getByTestId("submit-node-modal").click()
      cy.pause()
      cy.wait("@addNode")
    })

    cy.getNodeByTitle("Answer Node").then(answer => {
      cy.pause()
      cy.getNodeById(answer.id).click()
      cy.openLightbox(answer.id).within(() => {
        cy.contains("Answer Node").should("exist")
        cy.contains("Name: ").should("be.visible")
        cy.contains("To live.").should("be.visible")
      })
    })

    cy.getByTestId("close-lightbox").click()
  })
  cy.lightbox().should("not.exist")
})
