describe("Activity", () => {
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

  it("should be able to complete with a list-based answer", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("Activity")
      cy.contains(/add question/i).click()

      const listQuestion = `Name 3 provinces of Canada.`
      const listPlaceholder = "Enter answer here"

      cy.contains(/question text/i).click()
      cy.focused().type(listQuestion)
      cy.getByTestId("question-answer-list").click({ force: true })
      cy.getByTestId("question-answer-list-placeholder").type(listPlaceholder)

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        cy.get(`[placeholder="${listPlaceholder}"]`).should("be.visible")
        cy.getByTestId("list-input-0").type("British Columbia")
        cy.getByTestId("list-add-0").click()
        cy.getByTestId("list-input-1").type("Alberta")
        cy.getByTestId("list-add-1").click()
        cy.getByTestId("list-input-2").type("Nova Scotia")
        cy.getByTestId("list-add-2").click()
        cy.getByTestId("list-input-3").type("Manitoba")
        cy.get(`[class="media-wrapper"]`).scrollTo("bottom")

        cy.getByTestId("list-submit-btn").click()

        cy.contains(/thanks/i).should("be.visible")
        cy.contains(/done/i).click()
      })

      cy.openLightbox(node.id)
      cy.lightbox().within(() => {
        cy.getByTestId("list-input-0").should("be.visible")
        cy.getByTestId("list-input-1").should("be.visible")
        cy.getByTestId("list-input-2").should("be.visible")
        cy.getByTestId("list-input-3").should("be.visible")
        cy.getByTestId("close-lightbox").click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to support maximum allowable answers in the list answer type", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("Activity")
      cy.contains(/add question/i).click()

      const listQuestion = `Name 100 things.`
      const listPlaceholder = "Thing:"
      const minFieldsValue = " 95"

      cy.contains(/question text/i).click()
      cy.focused().type(listQuestion)
      cy.getByTestId("question-answer-list").click({ force: true })
      cy.getByTestId("question-answer-list-placeholder").type(listPlaceholder)
      cy.getByTestId("min-list-fields-input").clear()
      cy.getByTestId("min-list-fields-input").type(minFieldsValue)
      cy.getByTestId("list-max-checkbox").click({ force: true })

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        cy.get(`[placeholder="${listPlaceholder}"]`).should("be.visible")
        cy.get(`[class="media-wrapper"]`).scrollTo("bottom")
        cy.getByTestId("list-add-94").click()
        cy.getByTestId("list-add-95").click()
        cy.getByTestId("list-add-96").click()
        cy.getByTestId("list-add-97").click()
        cy.getByTestId("list-add-98").click()
        cy.getByTestId("list-add-98").should("not.be.visible")
        cy.getByTestId("list-submit-btn").click()

        cy.contains(/thanks/i).should("be.visible")
        cy.contains(/done/i).click()
      })

      cy.openLightbox(node.id)
      cy.lightbox().within(() => {
        cy.get(`[class="list"]`)
          .find("ul")
          .should("have.length", 100)
        cy.getByTestId("close-lightbox").click()
      })
      cy.lightbox().should("not.exist")
    })
  })
})
