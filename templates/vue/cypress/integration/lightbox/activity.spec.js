describe("Activity", () => {
  it("should be able to complete with a checkbox answer", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("activity")
      cy.contains(/add question/i).click()
      const question = `Select all numbers less than 3?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-multipleChoice-0").click({ force: true })
      cy.getByTestId("question-answer-multipleChoice-multipleAnswer").click({
        force: true,
      })

      cy.getByTestId(`choicerow-checkbox-1`)
        .getByTestId(`choicerow-checkbox-input-1`)
        .click()
        .type("1")
      cy.getByTestId(`choicerow-checkbox-2`)
        .getByTestId(`choicerow-checkbox-input-2`)
        .click()
        .type("2")
      cy.getByTestId(`choicerow-checkbox-3`)
        .getByTestId(`choicerow-checkbox-input-3`)
        .click()
        .type("3")

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        cy.getByTestId(`user-choicerow-checkbox-1`)
          .getByTestId(`user-choicerow-checkbox-checked-1`)
          .click({ force: true })
        cy.getByTestId(`user-choicerow-checkbox-2`)
          .getByTestId(`user-choicerow-checkbox-checked-2`)
          .click({ force: true })

        cy.contains(/submit/i).click()
        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete with a radio answer", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("activity")
      cy.contains(/add question/i).click()
      const question = `What is 5 + 5?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-multipleChoice-0").click({ force: true })
      cy.getByTestId("question-answer-multipleChoice-singleAnswer").click({
        force: true,
      })
      cy.getByTestId(`choicerow-radio-50`)
        .getByTestId(`choicerow-radio-input-50`)
        .click()
        .type("100")
      cy.getByTestId(`choicerow-radio-51`)
        .getByTestId(`choicerow-radio-input-51`)
        .click()
        .type("90")
      cy.getByTestId(`choicerow-radio-52`)
        .getByTestId(`choicerow-radio-input-52`)
        .click()
        .type("10")

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        cy.getByTestId(`user-choicerow-radio-52`)
          .getByTestId(`user-choicerow-radio-checked-52`)
          .click({ force: true })

        cy.contains(/submit/i).click()
        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to switch between questions in an activity", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("activity")
      const question = `What's your name?`
      const placeholder = "placeholder"
      const answer = "Tapestry"
      cy.contains(/add question/i).click()

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-text-0").click({ force: true })
      cy.getByTestId("question-answer-text-single-0").click({ force: true })
      cy.getByTestId("question-answer-text-single-placeholder-0").type(placeholder)

      cy.contains(/add question/i).click()
      const question2 = `What's your favorite pet?`
      const placeholder2 = "placeholder 2"
      const answer2 = "Dog"
      cy.getByTestId("question-text-1").click()
      cy.focused().type(question2)
      cy.getByTestId("question-answer-text-1").click({ force: true })
      cy.getByTestId("question-answer-text-single-1").click({ force: true })
      cy.getByTestId("question-answer-text-single-placeholder-1").type(placeholder2)

      cy.submitModal()
      cy.openLightbox(node.id)
      cy.route("POST", "/users/activity/**").as("submit")
      cy.lightbox().within(() => {
        cy.get(`[placeholder="${placeholder}"]`).should("be.visible")
        cy.get("input").type(answer)
        cy.contains(/submit/i).click()
        cy.contains("Thanks!").should("be.visible")
        cy.getByTestId("completion-next-button").click()
        cy.get("input").type(answer2)
        cy.contains(/submit/i).click()
        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to edit single-line text already answered question", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("activity")
      const question = `What's your name?`
      const placeholder = "placeholder"
      const answer = "Tapestry"
      cy.contains(/add question/i).click()

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
      cy.openModal("edit", node.id)
      const question2 = ` and what's your favorite color?`
      const answer2 = " and my favorite color is blue"
      cy.contains(/question text/i).click()
      cy.focused().type(question2)
      cy.getByTestId("question-answer-text-multi-0").click({ force: true })
      cy.submitModal()
      cy.openLightbox(node.id)
      cy.route("POST", "/users/activity/**").as("submit")
      cy.lightbox().within(() => {
        cy.get("textarea").type(answer2)
        cy.contains(/submit/i).click()
        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete an activity with a text-based answer", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("activity")
      const question = `What's your name?`
      const placeholder = "placeholder"
      const answer = "Tapestry"
      cy.contains(/add question/i).click()

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
  })

  it("should be able to complete an activity with an audio-based answer", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("activity")

      const question = `What's your name?`

      cy.contains(/add question/i).click()

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-audio-0").click({ force: true })

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.contains(/microphone access/i, { timeout: 10000 }).should("not.exist")
      cy.clock()

      cy.getByTestId("record").click()

      cy.tick(5 * 1000) // move forward by 5 seconds
      cy.contains("0:05").should("be.visible")

      cy.getByTestId("record").click() // pause
      cy.tick(5 * 1000)
      cy.contains("0:05").should("be.visible")

      cy.getByTestId("record").click() // resume

      cy.tick(3600 * 1000) // move forward by 1 hour
      cy.contains("1:00:05").should("be.visible")
      cy.getByTestId("done-button-audio").click()
      cy.getByTestId("submit-button-audio").click()
      cy.contains("Thanks!").should("be.visible")
      cy.contains(/done/i).click()
    })
  })
})
