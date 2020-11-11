describe("Video", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to add a video node via url", () => {
    const url =
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.getByTestId(`node-video-url`).type(url)
      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.get("video").should("have.attr", "src", url)

        cy.get("video").should($el => {
          const video = $el.get(0)
          expect(video.paused).to.be.false
        })
        cy.get("video").then($el => $el.get(0).pause())

        cy.getByTestId("play-screen").should("exist")
      })
      cy.closeLightbox()

      cy.updateNodeProgress(node.id, 1)

      cy.openLightbox(node.id).within(() => {
        cy.getByTestId("end-screen").should("be.visible")
        cy.contains(/rewatch/i).should("be.visible")
        cy.contains(/close/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to add a video node via youtube", () => {
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

  it("Should show an error and not create a node if an mp4 URL is invalid", () => {
    cy.getSelectedNode().then(parent => {
      const nodeName = "Video 1"

      cy.openModal("add", parent.id)
      cy.getByTestId(`node-title`).type(nodeName)

      cy.changeMediaType("video")
      cy.getByTestId(`node-video-url`).type("www.example.com/video.mp4")

      cy.submitModalWithError()
      cy.contains("Invalid mp4 Video URL: please re-upload or check the URL").should(
        "exist"
      )

      cy.contains(/cancel/i).click()
      cy.contains(`/${nodeName}/i`).should("not.exist")
    })
  })
})
