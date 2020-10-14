describe("Activity", () => {
  it(`
    Given: A video node
    When: A question is added with an audio-based answer
    Then: A user should be able to visit and answer the question
  `, () => {
    cy.fixture("root.json").as("oneNode")
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.getByTestId(`node-video-url`).type(
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      )

      const question = `What's your name?`

      cy.contains(/activity/i).click()
      cy.contains(/add question/i).click()

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.contains(/audio/i).click()

      cy.submitModal()

      cy.updateNodeProgress(node.id, 1)
      cy.openLightbox(node.id)

      cy.contains(/question/i).click()
      cy.getByTestId("record").should("be.visible")
      cy.contains(/done/i).should("be.disabled")
    })
  })
})
