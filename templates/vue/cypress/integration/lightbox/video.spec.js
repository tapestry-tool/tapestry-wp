describe("Video", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it(`
    Given: A Tapestry node
    When: It's changed to a video node and opened
    Then: It should show the corresponding video
  `, () => {
    const url =
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.getByTestId(`node-video-url`).type(url)
      cy.submitModal()

      cy.server()
      cy.route("POST", `**/users/progress`).as("saveProgress")

      cy.openLightbox(node.id).within(() => {
        cy.get("video").should("have.attr", "src", url)
        cy.wait("@saveProgress")

        cy.get("video").then($el => {
          const video = $el.get(0)
          expect(video.paused).to.be.false
          video.pause()
        })

        cy.getByTestId("play-screen").should("exist")
      })
      cy.closeLightbox()

      /**
       * Skip to end screen but don't set progress to 1:
       *    If progress is 1, the app automatically restarts the video
       *    when the lightbox is opened again.
       */
      cy.updateNodeProgress(node.id, 0.98)

      cy.openLightbox(node.id).within(() => {
        cy.contains(/rewatch/i).should("be.visible")
        cy.contains(/close/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it(`
    Given: A Tapestry node
    When: It is given a YouTube url
    Then: It should show the YouTube video
  `, () => {
    const url = "https://www.youtube.com/watch?v=wAPCSnAhhC8"

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.getByTestId(`node-video-url`).type(url)
      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.get("iframe[id^=youtube]").should("be.visible")
      })
    })
  })
})
