describe("Activity", () => {
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
      cy.route("GET", "**/entries*").as("entries")

      cy.contains(/done/i).click()
      cy.lightbox().within(() => {
        cy.get("audio").should("be.visible")
        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")
        cy.wait("@entries")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })
})
