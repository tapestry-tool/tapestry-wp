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

      cy.openLightbox(node.id).within(() => {
        cy.get("video").should("have.attr", "src", url)
      })
      cy.closeLightbox()

      cy.editNode(node.id, {
        progress: 1,
      })

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
