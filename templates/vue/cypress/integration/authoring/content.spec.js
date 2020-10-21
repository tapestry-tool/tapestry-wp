import { setup, cleanup } from "../../support/utils"

describe("Node content", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
  })

  afterEach(cleanup)

  it("Should be able to edit content fields and see the changes applied", () => {
    setup("@oneNode")

    cy.getSelectedNode().then(node => {
      const oldTitle = node.title
      cy.contains(oldTitle).should("exist")

      cy.getNodeByTitle(oldTitle).editNode({
        title: "new title",
      })

      cy.contains(oldTitle).should("not.exist")
      cy.contains("new title").should("exist")
    })
  })

  describe("Media types", () => {
    beforeEach(() => {
      setup("@oneNode")
    })

    it("Should be able to add a text node and verify that the text matches what was entered", () => {
      const newNode = {
        mediaType: "text",
        typeData: {
          textContent: "Hello world!",
        },
      }
      cy.getSelectedNode()
        .editNode(newNode)
        .openLightbox()
        .contains(newNode.typeData.textContent)
        .should("exist")
    })

    it("Should be able to add a video url and length and have the video load", () => {
      const newNode = {
        mediaType: "video",
        typeData: {
          url:
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        },
      }
      cy.getSelectedNode()
        .editNode(newNode)
        .openLightbox()
        .within(() => {
          cy.get("video").should("have.attr", "src", newNode.typeData.url)
        })
    })

    it("Should be able to add an external link node and have it show a summary of the external page", () => {
      const newNode = {
        mediaType: "url-embed",
        typeData: {
          behaviour: "new-window",
          title: "5 JavaScript Tricks That Are Good To Know",
          url:
            "https://levelup.gitconnected.com/5-javascript-tricks-that-are-good-to-know-78045dea6678",
        },
      }
      cy.getSelectedNode()
        .editNode(newNode)
        .openLightbox()
        .within(() => {
          cy.contains(newNode.typeData.title).should("exist")
        })
    })

    // Skipping this because related to gravity forms
    it.skip("Should be able to add a quiz to a video and have that quiz appear at the end of the video", () => {
      const newNode = {
        mediaType: "video",
        typeData: {
          url:
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        },
        activity: [
          {
            title: "What's your name?",
            answerTypes: {
              text: 1,
            },
          },
        ],
      }

      cy.getSelectedNode()
        .editNode(newNode) // TODO: Add support for quiz updates
        .openLightbox()
        .within(() => {
          cy.get("video").should(video => {
            expect(video.get(0).paused).to.be.false
          })
          cy.get("video").then(el => {
            const video = el.get(0)
            cy.wait(10)
            video.currentTime = video.duration
            cy.contains(/question/i).click({ force: true })
            cy.contains(newNode.activity[0].title).should("exist")
          })
        })
    })

    // Skipping this because related to gravity forms
    it.skip("Should be able to add a Gravity Form and have the form be visible", () => {
      const newNode = {
        mediaType: "gravity-form",
        typeData: {
          id: 1,
        },
      }
      cy.getSelectedNode()
        .editNode(newNode)
        .openLightbox()
        .within(() => cy.get(".gf-container").should("exist"))
    })
  })
})
