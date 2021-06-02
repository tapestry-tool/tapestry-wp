describe("Question", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
  })

  it("should be able to complete with a text-based answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What's your name?`
      const placeholder = "placeholder"
      const answer = "Tapestry"

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-text").click({ force: true })
      cy.getByTestId("question-answer-text-single").click({ force: true })
      cy.getByTestId("question-answer-text-single-placeholder").type(placeholder)

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        cy.get(`[placeholder="${placeholder}"]`).should("be.visible")
        cy.get("input").type(answer)

        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete with an audio-based answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What's your name?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.contains(/audio/i).click()

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

      cy.route("POST", "**/quiz*").as("submit")

      cy.contains(/done/i).click()
      cy.lightbox().within(() => {
        cy.get("audio").should("be.visible")
        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete with an audio-based answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What's your name?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.contains(/audio/i).click()

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

      cy.route("POST", "**/quiz*").as("submit")

      cy.contains(/done/i).click()
      cy.lightbox().within(() => {
        cy.get("audio").should("be.visible")
        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete with a list-based answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

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
        cy.get("input").type("British Columbia")
        cy.contains(/add/i).click()
        cy.get("input").type("Alberta")
        cy.contains(/add/i).click()
        cy.get("input").type("Nova Scotia")
        cy.contains(/add/i).click()
        cy.get("input").type("Manitoba")
        cy.contains(/add/i).click()
        cy.contains(/british columbia/i).should("be.visible")
        cy.contains(/alberta/i).should("be.visible")
        cy.contains(/nova scotia/i).should("be.visible")
        cy.contains(/manitoba/i).should("be.visible")

        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })
})
