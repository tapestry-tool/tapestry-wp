describe("Video", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("adding a youtube video should also set a thumbnail", () => {
    const url = "https://www.youtube.com/watch?v=cbuZfY2S2UQ"

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.changeMediaFormat("youtube")
      cy.getByTestId(`node-video-youtube-url`).type(url)
      cy.submitModal() // automatically confirms

      cy.getNodeById(node.id).within(() => {
        cy.get("image").should("have.attr", "href")
      })
    })
  })

  it("should be able to add a video node via url", () => {
    const url =
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.getByTestId(`node-video-mp4-url`).type(url)
      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.get("video").should("have.attr", "src", url)

        cy.get("video").should($el => {
          const video = $el.get(0)
          expect(video.paused).to.be.true
        })

        cy.getByTestId("play-screen").should("exist")
      })
      cy.closeLightbox()

      cy.logout().visitTapestry()

      cy.updateNodeProgress(node.id, 1)

      cy.openLightbox(node.id).within(() => {
        cy.getByTestId("end-screen").should("be.visible")
        cy.contains(/rewatch/i)
          .scrollIntoView()
          .should("be.visible")
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
      cy.changeMediaFormat("youtube")
      cy.getByTestId(`node-video-youtube-url`).type(url)
      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.get("iframe[id^=youtube]").should("be.visible")
      })
    })
  })

  it("should automatically update video url when the current url becomes unavailable", () => {
    const url =
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    const nonexistentUrl = "https://streaming.video.ubc.ca/non-existent.mp4"

    cy.getSelectedNode().then(selectedNode => {
      cy.openModal("edit", selectedNode.id)
      cy.changeMediaType("video")
      cy.getByTestId(`node-video-mp4-url`).type(url)
      cy.submitModal()
    })

    cy.getSelectedNode().then(selectedNode => {
      // Simulate the file at the current url becoming unavailable
      cy.store().then(store => {
        store.commit("updateNode", {
          id: selectedNode.id,
          newNode: {
            typeData: { ...selectedNode.typeData, mediaURL: nonexistentUrl },
          },
        })
      })

      // Assert that the url was changed
      cy.openModal("edit", selectedNode.id)
      cy.getByTestId(`node-video-mp4-url`)
        .invoke("val")
        .should("eq", nonexistentUrl)
      cy.get(".close").click()

      cy.openLightbox(selectedNode.id).within(() => {
        cy.get("video").should("have.attr", "src", url)
      })
    })
  })

  const kalturaId = "0_lchbo276"

  it("should be able to add a video node via Kaltura and use regular player", () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.changeMediaFormat("kaltura")

      cy.getByTestId("node-video-kaltura-id").type(kalturaId)
      cy.get('input[name="node-video-player"]')
        .first() // Choose regular player
        .check({ force: true })

      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        // Check that the media URL comes from Kaltura. We just check that the URL includes the Kaltura ID
        cy.get("video")
          .invoke("attr", "src")
          .should("include", kalturaId)
      })
    })
  })

  it("should be able to add a video node via Kaltura and use Kaltura player", () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.changeMediaFormat("kaltura")

      cy.getByTestId("node-video-kaltura-id").type(kalturaId)
      cy.get('input[name="node-video-player"]')
        .last() // Switch to Kaltura player
        .check({ force: true })

      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.get(`#kaltura-container-${node.id} > iframe`, { timeout: 10000 }).should(
          "be.visible"
        )
      })
    })
  })

  it("adding a kaltura video should also set a thumbnail", () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("video")
      cy.changeMediaFormat("kaltura")
      cy.getByTestId("node-video-kaltura-id").type(kalturaId)
      cy.submitModal() // automatically confirms

      cy.getNodeById(node.id).within(() => {
        // Check that the thumbnail URL comes from Kaltura. We just check that the URL includes the Kaltura ID
        cy.get("image")
          .invoke("attr", "href")
          .should("include", kalturaId)
      })
    })
  })
})
